const express = require('express');
const router = express.Router();
const multer = require('multer');
const GalleryItem = require('../models/GalleryItem');
const { createCloudinaryStorage } = require('../utils/cloudinary');

// Multer storage configuration for gallery showcase images using Cloudinary
const storage = createCloudinaryStorage('dermelixir_gallery');
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Create
router.post('/', upload.single('galleryImage'), async (req, res) => {
  try {
    let { title, url, order } = req.body;
    if (req.file) {
      url = req.file.path; // Cloudinary URL
    }
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and image are required' });
    }
    if (order === undefined || order === null || order === '') {
      const last = await GalleryItem.findOne().sort({ order: -1 });
      order = last ? last.order + 1 : 1;
    }
    await GalleryItem.create({ title, url, order: Number(order) });
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
router.put('/:id', upload.single('galleryImage'), async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      updateData.url = req.file.path; // Cloudinary URL
    }
    if (updateData.order !== undefined && updateData.order !== null && updateData.order !== '') {
      updateData.order = Number(updateData.order);
    }
    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
