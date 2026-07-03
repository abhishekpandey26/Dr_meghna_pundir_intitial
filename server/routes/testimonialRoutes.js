const express = require('express');
const router = express.Router();
const VideoTestimonial = require('../models/VideoTestimonial');
const PhotoTestimonial = require('../models/PhotoTestimonial');

/* ─── VIDEO TESTIMONIALS ──────────────────────────────────────────────────── */

// GET /api/testimonials/videos?page=1&limit=6
router.get('/videos', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 6);
    const skip  = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      VideoTestimonial.find()
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VideoTestimonial.countDocuments(),
    ]);

    res.json({ videos, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/testimonials/videos/all  (for admin list — no pagination)
router.get('/videos/all', async (req, res) => {
  try {
    const videos = await VideoTestimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/testimonials/videos
router.post('/videos', async (req, res) => {
  const { title, youtubeUrl, category, order } = req.body;
  if (!title || !youtubeUrl) {
    return res.status(400).json({ error: 'title and youtubeUrl are required' });
  }
  try {
    const doc = await VideoTestimonial.create({ title, youtubeUrl, category, order });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/testimonials/videos/:id
router.put('/videos/:id', async (req, res) => {
  try {
    const updated = await VideoTestimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/testimonials/videos/:id
router.delete('/videos/:id', async (req, res) => {
  try {
    await VideoTestimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── PHOTO TESTIMONIALS ──────────────────────────────────────────────────── */

// GET /api/testimonials/photos?page=1&limit=9
router.get('/photos', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 9);
    const skip  = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      PhotoTestimonial.find()
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PhotoTestimonial.countDocuments(),
    ]);

    res.json({ photos, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/testimonials/photos/all  (for admin)
router.get('/photos/all', async (req, res) => {
  try {
    const photos = await PhotoTestimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/testimonials/photos
router.post('/photos', async (req, res) => {
  const { title, treatment, beforeUrl, afterUrl, description, order } = req.body;
  if (!title || !beforeUrl || !afterUrl) {
    return res.status(400).json({ error: 'title, beforeUrl, and afterUrl are required' });
  }
  try {
    const doc = await PhotoTestimonial.create({ title, treatment, beforeUrl, afterUrl, description, order });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/testimonials/photos/:id
router.put('/photos/:id', async (req, res) => {
  try {
    const updated = await PhotoTestimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/testimonials/photos/:id
router.delete('/photos/:id', async (req, res) => {
  try {
    await PhotoTestimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
