const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/analyticsController');

router.get('/overview', getOverview);

module.exports = router;
