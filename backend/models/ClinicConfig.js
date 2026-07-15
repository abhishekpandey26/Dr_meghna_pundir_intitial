const mongoose = require('mongoose');

const clinicConfigSchema = new mongoose.Schema({
  startHour: { type: String, default: '09:00' },
  endHour: { type: String, default: '19:30' },
  slotDuration: { type: Number, default: 10 },
  blockedDates: [{ type: String }], // Array of "MMM DD" or YYYY-MM-DD
  holidays: [{ type: String }],    // Names of holidays
});

module.exports = mongoose.model('ClinicConfig', clinicConfigSchema);
