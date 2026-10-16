const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    movie: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
      title: String,
      poster: String,
      certificate: String,
      duration: Number,
      format: String,
      language: String,
    },
    theatre: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
      name: String,
      city: String,
      address: String,
      screenName: String,
    },
    showDetails: {
      date: String,
      startTime: String,
    },
    seats: [
      {
        seatNumber: String,
        tier: String,
        price: Number,
      },
    ],
    ticketCount: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 2.5,
    },
    tax: {
      type: Number,
      default: 1.8,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    paymentId: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: 'Credit Card',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    qrData: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
