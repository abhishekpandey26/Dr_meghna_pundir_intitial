const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const OTP = require('../models/OTP');
const Appointment = require('../models/Appointment');
const { sendOtpEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_patient_portal_123';

// Helper to validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Middleware to protect patient routes
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const patient = await Patient.findOne({ email: decoded.email.toLowerCase() });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    req.patient = patient;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * @route POST /api/auth/google-login
 * @desc Authenticate patient via Google and return session token
 */
router.post('/google-login', async (req, res) => {
  try {
    let { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    email = email.trim().toLowerCase();

    // Find or create patient profile
    let patient = await Patient.findOne({ email });
    if (!patient) {
      // Look up existing appointments to pre-populate details
      const lastAppt = await Appointment.findOne({ email }).sort({ createdAt: -1 });
      patient = new Patient({
        email,
        name: name || (lastAppt ? lastAppt.patientName : ''),
        mobile: lastAppt ? lastAppt.mobile : '',
        age: lastAppt ? lastAppt.age : undefined
      });
      await patient.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: patient._id, email: patient.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Fetch matching appointments
    const appointments = await Appointment.find({ email }).sort({ date: -1, startTime: -1 });

    return res.json({
      success: true,
      token,
      patient: {
        id: patient._id,
        email: patient.email,
        name: patient.name,
        mobile: patient.mobile,
        age: patient.age
      },
      appointments
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    return res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});

/**
 * @route GET /api/auth/patient-profile
 * @desc Fetch logged in patient's profile and booking history
 */
router.get('/patient-profile', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ email: req.patient.email }).sort({ date: -1, startTime: -1 });
    
    return res.json({
      success: true,
      patient: {
        id: req.patient._id,
        email: req.patient.email,
        name: req.patient.name,
        mobile: req.patient.mobile
      },
      appointments
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile data' });
  }
});

/**
 * @route PUT /api/auth/update-profile
 * @desc Update logged in patient's name and phone number
 */
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, mobile, age } = req.body;
    
    // Validations if provided
    if (name && (name.trim().length < 2 || !/^[A-Za-z\s]+$/.test(name))) {
      return res.status(400).json({ success: false, message: 'Name must contain only letters and be at least 2 characters long' });
    }
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9' });
    }
    if (age !== undefined) {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        return res.status(400).json({ success: false, message: 'Enter a valid age between 1 and 120' });
      }
    }

    if (name !== undefined) req.patient.name = name.trim();
    if (mobile !== undefined) req.patient.mobile = mobile.trim();
    if (age !== undefined) req.patient.age = parseInt(age, 10);

    await req.patient.save();

    return res.json({
      success: true,
      patient: {
        id: req.patient._id,
        email: req.patient.email,
        name: req.patient.name,
        mobile: req.patient.mobile,
        age: req.patient.age
      }
    });
  } catch (error) {
    console.error('Error updating patient profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router;
