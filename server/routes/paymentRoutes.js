const express = require('express');
const router = express.Router();
const { getPaymentReceipt } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/:transactionId', protect, getPaymentReceipt);

module.exports = router;
