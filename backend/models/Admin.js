const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    default: 'megha.pundir.singh@gmail.com'
  },
  password: {
    type: String, // Hashed password
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
