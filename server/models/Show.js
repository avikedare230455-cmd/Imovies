const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  row: {
    type: String,
    required: true,
  },
  col: {
    type: Number,
    required: true,
  },
  tier: {
    type: String,
    enum: ['VIP', 'Premium', 'Standard'],
    default: 'Standard',
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'locked', 'booked'],
    default: 'available',
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  lockedAt: {
    type: Date,
    default: null,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    screenName: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g. "10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM"
      required: true,
    },
    priceTiers: {
      vip: { type: Number, default: 22 },
      premium: { type: Number, default: 16 },
      standard: { type: Number, default: 12 },
    },
    seats: [seatSchema],
    totalSeats: {
      type: Number,
      default: 70,
    },
    availableSeatsCount: {
      type: Number,
      default: 70,
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
      default: 'IMAX 3D',
    },
    language: {
      type: String,
      default: 'English',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Composite index for fast searching of shows by movie, theatre, date
showSchema.index({ movie: 1, date: 1 });
showSchema.index({ theatre: 1, date: 1 });

module.exports = mongoose.model('Show', showSchema);
