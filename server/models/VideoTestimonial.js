const mongoose = require('mongoose');

const videoTestimonialSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  youtubeUrl: { type: String, required: true },
  category:   { type: String, default: 'General' },
  order:      { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('VideoTestimonial', videoTestimonialSchema);
