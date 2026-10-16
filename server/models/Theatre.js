const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  totalSeats: {
    type: Number,
    default: 70,
  },
  rows: {
    type: Number,
    default: 7, // A, B, C, D, E, F, G
  },
  seatsPerRow: {
    type: Number,
    default: 10, // 1 to 10
  },
  tierConfig: {
    vipRows: { type: [String], default: ['A', 'B'] },
    premiumRows: { type: [String], default: ['C', 'D', 'E'] },
    standardRows: { type: [String], default: ['F', 'G'] },
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    amenities: {
      type: [String],
      default: ['IMAX 3D', 'Dolby Atmos 7.1', 'Luxury Recliners', 'Gourmet Cafe', 'Parking'],
    },
    screens: [screenSchema],
    phone: {
      type: String,
      default: '+1 (800) 555-CINE',
    },
    rating: {
      type: Number,
      default: 4.7,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theatre', theatreSchema);
