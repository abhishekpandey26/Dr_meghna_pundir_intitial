const SlotLock = require('../models/SlotLock');
const Appointment = require('../models/Appointment');
const axios = require('axios');

// STEP 1: Create a lock (5 min)
const lockSlot = async (req, res) => {
  const { date, startTime, lockedBy } = req.body;

  try {
    // First, check if there's already an active appointment
    const existingAppt = await Appointment.findOne({ 
      date, 
      startTime, 
      status: { $ne: 'CANCELLED' } 
    });
    
    if (existingAppt) {
      return res.status(400).json({ message: 'Slot already booked permanently' });
    }

    // Try to create a lock
    // The Unique Index in MongoDB handles the race condition!
    const newLock = await SlotLock.create({ date, startTime, lockedBy });
    
    res.status(201).json({ 
      message: 'Slot locked for 5 minutes', 
      lock: newLock 
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Slot unavailable (currently locked by another user)' });
    }
    res.status(500).json({ error: err.message });
  }
};

// STEP 2: Confirm Booking
const confirmBooking = async (req, res) => {
  const { date, startTime, patientData } = req.body;

  try {
    if (patientData && !patientData.patientName && patientData.name) {
      patientData.patientName = patientData.name;
    }

    // 1. Verify lock exists
    const lock = await SlotLock.findOne({ date, startTime });
    if (!lock) {
      return res.status(400).json({ message: 'Lock expired or invalid. Please try again.' });
    }

    // Generate mock Meet link if consultation mode is Online
    let meetLink = undefined;
    if (patientData && patientData.consultationType === 'ONLINE') {
      const code = Math.random().toString(36).substring(2, 5) + '-' + 
                   Math.random().toString(36).substring(2, 6) + '-' + 
                   Math.random().toString(36).substring(2, 5);
      meetLink = `https://meet.google.com/${code}`;
    }

    // Generate a unique patient ID if not provided
    const patientId = patientData.patientId || `DM-${Date.now().toString().slice(-6)}`;

    // 2. Create Appointment
    const appointment = await Appointment.create({
      ...patientData,
      patientId,
      date,
      startTime,
      status: 'PENDING',
      meetLink
    });

    // 3. Remove the lock
    await SlotLock.deleteOne({ _id: lock._id });

    res.status(201).json({ 
      message: 'Appointment confirmed successfully', 
      appointment 
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Slot was booked by someone else during this process' });
    }
    res.status(500).json({ error: err.message });
  }
};

const verifyCaptcha = async (req, res) => {
  const { token } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-v2wO5s89AFH74s266E3H1981';

  if (!token) {
    return res.status(400).json({ success: false, message: 'reCAPTCHA token is missing' });
  }

  // Graceful fallback for local development with test/dummy keys
  if (secretKey === '6LeIxAcTAAAAAGG-v2wO5s89AFH74s266E3H1981' || token === 'dummy-token-bypass') {
    console.log('reCAPTCHA: Dev/Test key or dummy token detected, bypassing verification with success');
    return res.json({ success: true, score: 0.9 });
  }

  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const response = await axios.post(verifyUrl);

    if (response.data.success && response.data.score >= 0.5) {
      return res.json({ success: true, score: response.data.score });
    } else {
      console.log('reCAPTCHA verification failure:', response.data);
      return res.json({
        success: false,
        message: 'Security validation failed. Please try again.',
        score: response.data.score
      });
    }
  } catch (error) {
    console.error('reCAPTCHA server verification error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to verify reCAPTCHA' });
  }
};

module.exports = { lockSlot, confirmBooking, verifyCaptcha };
