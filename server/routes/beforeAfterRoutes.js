const express = require('express');
const router = express.Router();
const BeforeAfterItem = require('../models/BeforeAfterItem');

// GET all items
router.get('/', async (req, res) => {
  try {
    let items = await BeforeAfterItem.find().sort({ createdAt: -1 });
    
    // Auto-seed default transformations if database is empty
    if (items.length === 0) {
      const defaults = [
        {
          title: 'Severe Vulgaris Resolution',
          treatment: 'Acne Therapy',
          beforeUrl: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=600',
          afterUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600'
        },
        {
          title: 'Epidermal Pigment Smoothing',
          treatment: 'Laser Resurfacing',
          beforeUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600',
          afterUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=600'
        },
        {
          title: 'Follicular Density Restored',
          treatment: 'Hair Restoration',
          beforeUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&q=80&w=600',
          afterUrl: 'https://images.unsplash.com/photo-1566275529824-cca6d00a250f?auto=format&fit=crop&q=80&w=600'
        }
      ];
      items = await BeforeAfterItem.insertMany(defaults);
      // Sort them again
      items.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new item (Admin)
router.post('/', async (req, res) => {
  const { title, treatment, beforeUrl, afterUrl } = req.body;
  
  if (!title || !treatment || !beforeUrl || !afterUrl) {
    return res.status(400).json({ error: 'Please provide all fields: title, treatment, beforeUrl, afterUrl' });
  }

  try {
    const newItem = await BeforeAfterItem.create({ title, treatment, beforeUrl, afterUrl });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an item (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await BeforeAfterItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transformation item not found' });
    }
    res.json({ message: 'Transformation record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
