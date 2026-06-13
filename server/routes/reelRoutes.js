const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');

// Create
router.post('/', async (req, res) => {
  try {
    const item = await Reel.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read
router.get('/', async (req, res) => {
  try {
    const list = await Reel.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Reel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
