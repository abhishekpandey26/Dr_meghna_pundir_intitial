const Appointment = require('../models/Appointment');
const SlotLock = require('../models/SlotLock');
const ClinicConfig = require('../models/ClinicConfig');
const { generateSlots } = require('../utils/slotGenerator');

const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query; // Expects "YYYY-MM-DD"
    if (!date) return res.status(400).json({ message: 'Date required' });

    // 1. Get Clinic Config
    let config = await ClinicConfig.findOne();
    if (!config) {
      // Create default if not exists
      config = await ClinicConfig.create({});
    }

    // 2. Generate all possible slots
    const allSlots = generateSlots(config.startHour, config.endHour, config.slotDuration);

    // 3. Find already booked appointments for this date
    const booked = await Appointment.find({ date, status: { $ne: 'CANCELLED' } });
    const bookedSet = new Set(booked.map(a => a.startTime));

    // 4. Find active temporary locks
    const locked = await SlotLock.find({ date });
    const lockedSet = new Set(locked.map(l => l.startTime));

    // 5. Build response
    const finalSlots = allSlots.map(time => ({
      time,
      status: bookedSet.has(time) ? 'BOOKED' : lockedSet.has(time) ? 'LOCKED' : 'AVAILABLE'
    }));

    res.json({
      date,
      isBlocked: config.blockedDates.includes(date),
      slots: finalSlots
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAvailableSlots };
