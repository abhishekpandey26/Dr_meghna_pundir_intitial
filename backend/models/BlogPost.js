const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, default: 'Skincare Treatment' },
  author: { type: String, default: 'Dr. Megha Pundir Singh' },
  dateString: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
