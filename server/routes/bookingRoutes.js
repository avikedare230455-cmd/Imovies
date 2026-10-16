const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

module.exports = (socketHelper) => {
  const router = express.Router();

  router.post('/', protect, createBooking(socketHelper));
  router.get('/my-bookings', protect, getMyBookings);
  router.get('/admin/all', protect, adminOnly, getAllBookings);
  router.get('/:id', protect, getBookingById);
  router.put('/:id/cancel', protect, cancelBooking(socketHelper));

  return router;
};
