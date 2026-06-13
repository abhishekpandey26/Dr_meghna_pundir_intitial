const mongoose = require('mongoose');

const skinLeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  age: { type: Number },
  skinType: { type: String },
  scanResults: {
    overallScore: { type: Number, required: true },
    hydration: { type: Number, required: true },
    redness: { type: Number, required: true },
    pores: { type: Number, required: true },
    spots: { type: Number, required: true }
  },
  primaryConcern: { type: String },
  status: { type: String, enum: ['NEW', 'CONTACTED', 'CONVERTED'], default: 'NEW' }
}, { timestamps: true });

module.exports = mongoose.model('SkinLead', skinLeadSchema);
