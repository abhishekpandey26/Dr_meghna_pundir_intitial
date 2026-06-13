const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coverImage: { type: String, required: true },
  videoUrl: { type: String, required: true }, // URL to the video (Insta/YouTube)
  type: { type: String, enum: ['photo_camera', 'smart_display'], default: 'smart_display' },
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);
