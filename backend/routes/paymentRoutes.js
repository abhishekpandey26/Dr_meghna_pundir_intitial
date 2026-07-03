const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { bookingRateLimiter } = require('../middleware/rateLimiter');

router.post('/create', bookingRateLimiter, paymentController.createPaymentRequest);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
