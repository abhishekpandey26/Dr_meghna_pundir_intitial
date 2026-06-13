const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientId: { type: String, unique: true },
  treatment: { type: String, required: true },
  date: { type: String, required: true }, // "2026-06-11"
  startTime: { type: String, required: true }, // "10:30 AM"
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  concern: { type: String },
  consultationType: { 
    type: String, 
    enum: ['IN_CLINIC', 'ONLINE'], 
    default: 'IN_CLINIC' 
  },
  meetLink: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', 'PAYMENT_PENDING', 'PAYMENT_FAILED'],
    default: 'PAYMENT_PENDING'
  },
  paymentId: { type: String },
  paymentRequestId: { type: String },
  paymentStatus: { type: String, default: 'Pending' }
}, { timestamps: true });

// Prevent double booking on confirmed sessions
appointmentSchema.index({ date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
