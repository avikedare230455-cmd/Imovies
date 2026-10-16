const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Get payment receipt/details
// @route   GET /api/payments/:transactionId
// @access  Private
const getPaymentReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionId: req.params.transactionId })
      .populate('booking')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPaymentReceipt };
