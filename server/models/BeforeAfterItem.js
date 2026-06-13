const mongoose = require('mongoose');

const beforeAfterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  treatment: { type: String, required: true }, // e.g. 'Acne Therapy', 'Laser Resurfacing', 'Hair Restoration'
  beforeUrl: { type: String, required: true },
  afterUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('BeforeAfterItem', beforeAfterSchema);
