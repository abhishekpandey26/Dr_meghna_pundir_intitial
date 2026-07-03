const mongoose = require('mongoose');

const slotLockSchema = new mongoose.Schema({
  date: { type: String, required: true }, // e.g., "2026-06-11"
  startTime: { type: String, required: true }, // e.g., "10:00 AM"
  lockedBy: { type: String }, // Session ID or User Reference
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300 // 5 minutes in seconds (TTL Index)
  },
});

// Compound Unique Index: prevents duplicate locks for the same slot
slotLockSchema.index({ date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('SlotLock', slotLockSchema);
