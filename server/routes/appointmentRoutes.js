const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Get all appointments with pagination, filtering, and sorting (Admin)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { status, payment, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};
    
    // Payment group filter (paid / pending / all)
    if (payment === 'paid') {
      query.status = { $in: ['CONFIRMED', 'COMPLETED'] };
    } else if (payment === 'pending') {
      query.status = { $in: ['PENDING', 'PAYMENT_PENDING', 'PAYMENT_FAILED'] };
    } else if (status && status !== 'all') {
      query.status = status;
    }

    // Keyword search across multiple fields
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { treatment: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const appointments = await Appointment.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update status (Confirm, Compete, Cancel, etc.)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reschedule
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { date, startTime } = req.body;
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { 
      date, 
      startTime, 
      status: 'RESCHEDULED' 
    }, { new: true });
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Target slot is already booked' });
    res.status(500).json({ error: err.message });
  }
});

// Delete (Senior Dev addition)
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record purged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
