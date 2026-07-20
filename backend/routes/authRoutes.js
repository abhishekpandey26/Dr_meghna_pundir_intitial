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

// Admin authentication models and utilities
const Admin = require('../models/Admin');
const { hashPassword, verifyPassword } = require('../utils/passwordHelper');
const { sendAdminOtpEmail } = require('../utils/emailService');
const rateLimit = require('express-rate-limit');

const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'abhishekkumarp383@gmail.com').toLowerCase().trim();

// 1. Rate limiter for Admin Login: max 5 failed password attempts per 15 minutes
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many failed login attempts. Access locked for 15 minutes for security.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. Rate limiter for Sending OTP: max 3 requests per 15 minutes
const adminOtpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many OTP requests sent. Please wait 15 minutes before requesting another code.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 3. Rate limiter for Verifying OTP: max 5 failed attempts per 15 minutes
const adminOtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many invalid verification attempts. Reset process locked for 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Helper to ensure Admin document exists for owner
const ensureAdminExists = async () => {
  let admin = await Admin.findOne({ email: OWNER_EMAIL });
  if (!admin) {
    const defaultHashed = hashPassword('admin123');
    admin = new Admin({ email: OWNER_EMAIL, password: defaultHashed });
    await admin.save();
  } else if (!admin.password) {
    admin.password = hashPassword('admin123');
    await admin.save();
  }
  return admin;
};

/**
 * @route POST /api/auth/admin/send-otp
 * @desc Generate and send OTP to owner email for password setup/reset
 */
router.post('/admin/send-otp', adminOtpSendLimiter, async (req, res) => {
  try {
    const email = OWNER_EMAIL;

    // Ensure admin document exists in collection
    await ensureAdminExists();

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/update OTP in database
    await OTP.findOneAndUpdate(
      { email },
      { code: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send SMTP OTP email
    await sendAdminOtpEmail(email, otpCode);

    return res.json({ success: true, message: 'OTP verification code sent to owner email' });
  } catch (error) {
    console.error('Error in send-otp route:', error);
    return res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

/**
 * @route POST /api/auth/admin/verify-otp-reset-password
 * @desc Verify OTP and set a new password for the owner admin account
 */
router.post('/admin/verify-otp-reset-password', adminOtpVerifyLimiter, async (req, res) => {
  try {
    let { code, newPassword } = req.body;
    if (!code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Verification code and new password are required' });
    }

    const email = OWNER_EMAIL;
    code = code.trim();

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({ email, code });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Hash the password and save to Admin
    const hashedPassword = hashPassword(newPassword);
    const admin = await ensureAdminExists();
    admin.password = hashedPassword;
    await admin.save();

    // Remove the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.json({ success: true, message: 'New password established successfully' });
  } catch (error) {
    console.error('Error in verify-otp-reset-password route:', error);
    return res.status(500).json({ success: false, message: 'Failed to set new password' });
  }
});

/**
 * @route POST /api/auth/admin/login
 * @desc Authenticate owner admin and return session confirmation
 */
router.post('/admin/login', adminLoginLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    email = email.trim().toLowerCase();

    if (email !== OWNER_EMAIL) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials' });
    }

    // Ensure the admin account exists and has a default password set if empty
    await ensureAdminExists();

    const admin = await Admin.findOne({ email });
    if (!admin || !admin.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password not set yet. Please use Setup Owner Password option to define one.' 
      });
    }

    // Verify password
    const isMatch = verifyPassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials' });
    }

    // Generate JWT token for admin
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Access granted successfully',
      token,
      email: admin.email
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({ success: false, message: 'Authentication server error' });
  }
});

module.exports = router;
