const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  name: { type: String },
  mobile: { type: String },
  age: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
