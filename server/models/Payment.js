const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Apple Pay', 'Google Pay'],
      default: 'Credit Card',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded', 'pending'],
      default: 'pending',
    },
    cardLast4: {
      type: String,
      default: '4242',
    },
    gatewayResponse: {
      type: Object,
      default: {},
    },
    refundDetails: {
      refundId: String,
      refundedAt: Date,
      amount: Number,
      status: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
