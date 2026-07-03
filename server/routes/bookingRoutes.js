const express = require('express');
const router = express.Router();
const { lockSlot, confirmBooking, verifyCaptcha } = require('../controllers/bookingController');
const { bookingRateLimiter } = require('../middleware/rateLimiter');

router.post('/lock', lockSlot);
router.post('/confirm', bookingRateLimiter, confirmBooking);
router.post('/verify-captcha', verifyCaptcha);

module.exports = router;
