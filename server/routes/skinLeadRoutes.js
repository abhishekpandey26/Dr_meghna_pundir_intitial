const express = require('express');
const router = express.Router();
const SkinLead = require('../models/SkinLead');

// GET all leads (Admin)
router.get('/', async (req, res) => {
  try {
    const leads = await SkinLead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new lead (Public scanner interface submission)
router.post('/', async (req, res) => {
  const { name, email, mobile, age, skinType, scanResults, primaryConcern } = req.body;

  if (!name || !email || !mobile || !scanResults) {
    return res.status(400).json({ error: 'Please provide required fields: name, email, mobile, scanResults' });
  }

  try {
    const newLead = await SkinLead.create({
      name,
      email,
      mobile,
      age: age ? parseInt(age) : undefined,
      skinType,
      scanResults,
      primaryConcern
    });
    res.status(201).json(newLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH a lead status (Admin)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['NEW', 'CONTACTED', 'CONVERTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid lead status' });
  }

  try {
    const updated = await SkinLead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a lead (Admin cleanup)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await SkinLead.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead record purged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
