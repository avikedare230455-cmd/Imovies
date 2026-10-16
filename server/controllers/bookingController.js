const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Helper to generate unique booking ID
const generateBookingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'IMV-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create a new ticket booking & mock payment
// @route   POST /api/bookings
// @access  Private
const createBooking = (socketHelper) => async (req, res) => {
  try {
    const {
      showId,
      seatNumbers, // Array e.g. ['C4', 'C5']
      paymentMethod = 'Credit Card',
      cardLast4 = '4242',
      couponCode,
    } = req.body;

    if (!showId || !seatNumbers || !seatNumbers.length) {
      return res.status(400).json({ success: false, message: 'Show and selected seats are required' });
    }

    const show = await Show.findById(showId)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Verify seat availability
    const selectedSeatObjects = [];
    let subtotal = 0;

    for (const seatNum of seatNumbers) {
      const seat = show.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) {
        return res.status(400).json({ success: false, message: `Seat ${seatNum} is invalid` });
      }
      if (seat.status === 'booked') {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNum} has already been booked by another customer`,
        });
      }
      selectedSeatObjects.push({
        seatNumber: seat.seatNumber,
        tier: seat.tier,
        price: seat.price,
      });
      subtotal += seat.price;
    }

    // Fee calculations
    const convenienceFee = Number((seatNumbers.length * 1.5).toFixed(2));
    const tax = Number((subtotal * 0.08).toFixed(2));
    let discount = 0;

    if (couponCode && couponCode.toUpperCase() === 'IMOVIES20') {
      discount = Number((subtotal * 0.2).toFixed(2));
    } else if (couponCode && couponCode.toUpperCase() === 'CINEMA50') {
      discount = Number((subtotal * 0.5).toFixed(2));
    }

    const totalAmount = Number((subtotal + convenienceFee + tax - discount).toFixed(2));
    const bookingId = generateBookingId();
    const transactionId = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Booking record
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      show: show._id,
      movie: {
        id: show.movie._id,
        title: show.movie.title,
        poster: show.movie.poster,
        certificate: show.movie.certificate,
        duration: show.movie.duration,
        format: show.format,
        language: show.language,
      },
      theatre: {
        id: show.theatre._id,
        name: show.theatre.name,
        city: show.theatre.city,
        address: show.theatre.address,
        screenName: show.screenName,
      },
      showDetails: {
        date: show.date,
        startTime: show.startTime,
      },
      seats: selectedSeatObjects,
      ticketCount: seatNumbers.length,
      subtotal,
      convenienceFee,
      tax,
      discount,
      totalAmount,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      paymentId: transactionId,
      paymentMethod,
      qrData: JSON.stringify({
        bookingId,
        movie: show.movie.title,
        theatre: show.theatre.name,
        seats: seatNumbers,
        showTime: `${show.date} ${show.startTime}`,
      }),
    });

    // Create Payment transaction
    await Payment.create({
      transactionId,
      booking: booking._id,
      user: req.user._id,
      amount: totalAmount,
      paymentMethod,
      status: 'success',
      cardLast4: cardLast4 || '4242',
      gatewayResponse: {
        authorized: true,
        referenceNumber: `REF-${Math.floor(Math.random() * 1000000)}`,
        timestamp: new Date().toISOString(),
      },
    });

    // Update seats in Show document
    show.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.status = 'booked';
        seat.bookedBy = req.user._id;
        seat.lockedBy = null;
        seat.lockedAt = null;
      }
    });

    show.availableSeatsCount = Math.max(0, show.availableSeatsCount - seatNumbers.length);
    await show.save();

    // Broadcast live seat updates via Socket.io
    if (socketHelper && socketHelper.broadcastSeatsBooked) {
      socketHelper.broadcastSeatsBooked(show._id, seatNumbers);
    }

    // Create User Notification
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed! 🍿',
      message: `Your booking for "${show.movie.title}" (${seatNumbers.join(', ')}) at ${show.theatre.name} on ${show.date} ${show.startTime} is confirmed. Booking ID: ${bookingId}`,
      type: 'booking_success',
      data: { bookingId: booking._id },
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Tickets booked successfully!',
    });
  } catch (error) {
    console.error('[Create Booking Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user booking history
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking details by ID or code
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure user is authorized to view (own booking or admin)
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking and release seats with refund
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = (socketHelper) => async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership or admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    const refundAmount = Number((booking.totalAmount * 0.9).toFixed(2)); // 90% refund

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.refundAmount = refundAmount;
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();

    // Release seats in Show
    const show = await Show.findById(booking.show);
    if (show) {
      show.seats.forEach((seat) => {
        if (seatNumbers.includes(seat.seatNumber)) {
          seat.status = 'available';
          seat.bookedBy = null;
        }
      });
      show.availableSeatsCount = Math.min(show.totalSeats, show.availableSeatsCount + seatNumbers.length);
      await show.save();

      // Broadcast live release event
      if (socketHelper && socketHelper.broadcastSeatsReleased) {
        socketHelper.broadcastSeatsReleased(show._id, seatNumbers);
      }
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        status: 'refunded',
        refundDetails: {
          refundId: `RFD-${Date.now().toString().slice(-6)}`,
          refundedAt: new Date(),
          amount: refundAmount,
          status: 'Processed to original payment method',
        },
      }
    );

    // Create user notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled & Refund Initiated',
      message: `Your booking ${booking.bookingId} for "${booking.movie.title}" has been cancelled. A refund of $${refundAmount} has been credited.`,
      type: 'cancellation',
      data: { bookingId: booking._id, refundAmount },
    });

    res.json({
      success: true,
      data: booking,
      message: `Booking cancelled successfully. $${refundAmount} refund processed.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'movie.title': { $regex: search, $options: 'i' } },
        { 'theatre.name': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
};
