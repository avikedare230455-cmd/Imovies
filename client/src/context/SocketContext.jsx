import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lockedSeats, setLockedSeats] = useState({}); // { [seatNumber]: { lockedBy, isCurrentUser } }
  const [bookedSeats, setBookedSeats] = useState([]); // array of seat numbers booked live
  const currentShowRef = useRef(null);

  useEffect(() => {
    // Connect to server (using window.location.origin since proxy forwards /socket.io)
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      // console.log('[Socket] Connected to server, ID:', newSocket.id);
      setConnected(true);

      if (user?._id) {
        newSocket.emit('set_user', { userId: user._id });
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen to initial locks sent when entering a show
    newSocket.on('initial_locks', ({ showId, locks }) => {
      if (showId === currentShowRef.current) {
        setLockedSeats(locks || {});
      }
    });

    // Listen to single seat locked event
    newSocket.on('seat_locked', ({ showId, seatNumber, lockedBy }) => {
      if (showId === currentShowRef.current) {
        setLockedSeats((prev) => ({
          ...prev,
          [seatNumber]: {
            lockedBy,
            isCurrentUser: user?._id ? lockedBy === user._id : false,
          },
        }));
      }
    });

    // Listen to single seat unlocked event
    newSocket.on('seat_unlocked', ({ showId, seatNumber }) => {
      if (showId === currentShowRef.current) {
        setLockedSeats((prev) => {
          const next = { ...prev };
          delete next[seatNumber];
          return next;
        });
      }
    });

    // Listen to seats booked event
    newSocket.on('seats_booked', ({ showId, seatNumbers }) => {
      if (showId === currentShowRef.current) {
        setBookedSeats((prev) => [...new Set([...prev, ...seatNumbers])]);
        setLockedSeats((prev) => {
          const next = { ...prev };
          seatNumbers.forEach((s) => delete next[s]);
          return next;
        });
      }
    });

    // Listen to seats released event (e.g. cancellation)
    newSocket.on('seats_released', ({ showId, seatNumbers }) => {
      if (showId === currentShowRef.current) {
        setBookedSeats((prev) => prev.filter((s) => !seatNumbers.includes(s)));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Sync user change with socket
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('set_user', { userId: user._id });
    }
  }, [socket, user]);

  const joinShow = (showId) => {
    if (!socket || !showId) return;
    currentShowRef.current = showId;
    setLockedSeats({});
    setBookedSeats([]);
    socket.emit('join_show', { showId });
  };

  const leaveShow = (showId) => {
    if (!socket || !showId) return;
    socket.emit('leave_show', { showId });
    if (currentShowRef.current === showId) {
      currentShowRef.current = null;
    }
  };

  const lockSeat = (showId, seatNumber) => {
    if (!socket) return;
    socket.emit('lock_seat', { showId, seatNumber, userId: user?._id });
  };

  const unlockSeat = (showId, seatNumber) => {
    if (!socket) return;
    socket.emit('unlock_seat', { showId, seatNumber });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        lockedSeats,
        bookedSeats,
        joinShow,
        leaveShow,
        lockSeat,
        unlockSeat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
