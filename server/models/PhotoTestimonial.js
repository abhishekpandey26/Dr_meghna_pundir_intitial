const mongoose = require('mongoose');

const photoTestimonialSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  treatment:   { type: String, default: 'Skin Treatment' },
  beforeUrl:   { type: String, required: true },
  afterUrl:    { type: String, required: true },
  description: { type: String, default: '' },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PhotoTestimonial', photoTestimonialSchema);
