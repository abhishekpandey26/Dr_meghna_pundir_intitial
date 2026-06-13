const express = require('express');
const router = express.Router();
const { lockSlot, confirmBooking } = require('../controllers/bookingController');

router.post('/lock', lockSlot);
router.post('/confirm', confirmBooking);

module.exports = router;
