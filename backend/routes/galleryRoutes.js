const express = require('express');
const router = express.Router();
const GalleryItem = require('../models/GalleryItem');

// Create
router.post('/', async (req, res) => {
  try {
    let { order } = req.body;
    if (order === undefined || order === null || order === '') {
      const last = await GalleryItem.findOne().sort({ order: -1 });
      order = last ? last.order + 1 : 1;
    }
    await GalleryItem.create({ ...req.body, order });
    const list = await GalleryItem.find().sort({ order: 1, createdAt: -1 });
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read
router.get('/', async (req, res) => {
  try {
    const list = await GalleryItem.find().sort({ order: 1, createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
