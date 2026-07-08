const express = require('express');
const router = express.Router();
const ClinicConfig = require('../models/ClinicConfig');

// Get current config
router.get('/', async (req, res) => {
  try {
    let config = await ClinicConfig.findOne();
    if (!config) config = await ClinicConfig.create({});
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update config
router.put('/', async (req, res) => {
  try {
    const updated = await ClinicConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
