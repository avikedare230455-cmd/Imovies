const Show = require('../models/Show');

// In-memory tracking of active locks:
// { [showId]: { [seatNumber]: { socketId, userId, lockedAt, timer } } }
const showLocks = new Map();

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const setupSeatSocket = (io) => {
  io.on('connection', (socket) => {
    // console.log(`[Socket Connected] ID: ${socket.id}`);

    // Join show room
    socket.on('join_show', async ({ showId }) => {
      if (!showId) return;
      socket.join(`show_${showId}`);
      socket.currentShowId = showId;

      // Send current locks for this show to newly joined client
      const currentLocks = showLocks.get(showId) || {};
      const activeLocks = {};
      const now = Date.now();

      for (const [seatNum, lockData] of Object.entries(currentLocks)) {
        if (now - lockData.lockedAt < LOCK_DURATION_MS) {
          activeLocks[seatNum] = {
            lockedBy: lockData.userId,
            isCurrentUser: socket.userId === lockData.userId,
          };
        }
      }

      socket.emit('initial_locks', { showId, locks: activeLocks });
    });

    // User authentication on socket
    socket.on('set_user', ({ userId }) => {
      socket.userId = userId;
    });

    // Lock a seat
    socket.on('lock_seat', async ({ showId, seatNumber, userId }) => {
      try {
        if (!showId || !seatNumber) return;

        // Verify with DB if already booked
        const show = await Show.findById(showId);
        if (!show) {
          return socket.emit('seat_lock_error', { seatNumber, message: 'Show not found' });
        }

        const seat = show.seats.find((s) => s.seatNumber === seatNumber);
        if (!seat || seat.status === 'booked') {
          return socket.emit('seat_lock_error', { seatNumber, message: 'Seat already booked' });
        }

        if (!showLocks.has(showId)) {
          showLocks.set(showId, {});
        }

        const roomLocks = showLocks.get(showId);
        const existingLock = roomLocks[seatNumber];

        if (existingLock && existingLock.userId !== userId && Date.now() - existingLock.lockedAt < LOCK_DURATION_MS) {
          return socket.emit('seat_lock_error', {
            seatNumber,
            message: 'Seat is temporarily selected by another user',
          });
        }

        // Clear previous timer if exists
        if (existingLock?.timer) {
          clearTimeout(existingLock.timer);
        }

        // Set auto-release timer
        const timer = setTimeout(() => {
          if (roomLocks[seatNumber]) {
            delete roomLocks[seatNumber];
            io.to(`show_${showId}`).emit('seat_unlocked', { showId, seatNumber });
          }
        }, LOCK_DURATION_MS);

        roomLocks[seatNumber] = {
          socketId: socket.id,
          userId: userId || socket.id,
          lockedAt: Date.now(),
          timer,
        };

        // Broadcast to all sockets in the room
        io.to(`show_${showId}`).emit('seat_locked', {
          showId,
          seatNumber,
          lockedBy: userId || socket.id,
        });
      } catch (err) {
        console.error('[Socket lock_seat Error]', err.message);
      }
    });

    // Unlock a seat
    socket.on('unlock_seat', ({ showId, seatNumber }) => {
      if (!showId || !seatNumber) return;
      const roomLocks = showLocks.get(showId);
      if (roomLocks && roomLocks[seatNumber]) {
        if (roomLocks[seatNumber].timer) {
          clearTimeout(roomLocks[seatNumber].timer);
        }
        delete roomLocks[seatNumber];
        io.to(`show_${showId}`).emit('seat_unlocked', { showId, seatNumber });
      }
    });

    // Leave show room
    socket.on('leave_show', ({ showId }) => {
      if (showId) {
        socket.leave(`show_${showId}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Clean up locks created by this socket if not finalized
      for (const [showId, roomLocks] of showLocks.entries()) {
        for (const [seatNum, lockData] of Object.entries(roomLocks)) {
          if (lockData.socketId === socket.id) {
            if (lockData.timer) clearTimeout(lockData.timer);
            delete roomLocks[seatNum];
            io.to(`show_${showId}`).emit('seat_unlocked', { showId, seatNumber: seatNum });
          }
        }
      }
    });
  });

  // Helper method callable from HTTP booking controllers
  return {
    broadcastSeatsBooked: (showId, seatNumbers) => {
      const roomLocks = showLocks.get(showId.toString());
      if (roomLocks) {
        seatNumbers.forEach((seatNum) => {
          if (roomLocks[seatNum]?.timer) clearTimeout(roomLocks[seatNum].timer);
          delete roomLocks[seatNum];
        });
      }
      io.to(`show_${showId}`).emit('seats_booked', { showId, seatNumbers });
    },
    broadcastSeatsReleased: (showId, seatNumbers) => {
      io.to(`show_${showId}`).emit('seats_released', { showId, seatNumbers });
    },
  };
};

module.exports = setupSeatSocket;
