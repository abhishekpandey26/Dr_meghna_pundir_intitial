const SlotLock = require('../models/SlotLock');
const Appointment = require('../models/Appointment');

// STEP 1: Create a lock (5 min)
const lockSlot = async (req, res) => {
  const { date, startTime, lockedBy } = req.body;

  try {
    // First, check if there's already an active appointment
    const existingAppt = await Appointment.findOne({ 
      date, 
      startTime, 
      status: { $ne: 'CANCELLED' } 
    });
    
    if (existingAppt) {
      return res.status(400).json({ message: 'Slot already booked permanently' });
    }

    // Try to create a lock
    // The Unique Index in MongoDB handles the race condition!
    const newLock = await SlotLock.create({ date, startTime, lockedBy });
    
    res.status(201).json({ 
      message: 'Slot locked for 5 minutes', 
      lock: newLock 
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Slot unavailable (currently locked by another user)' });
    }
    res.status(500).json({ error: err.message });
  }
};

// STEP 2: Confirm Booking
const confirmBooking = async (req, res) => {
  const { date, startTime, patientData } = req.body;

  try {
    if (patientData && !patientData.patientName && patientData.name) {
      patientData.patientName = patientData.name;
    }

    // 1. Verify lock exists
    const lock = await SlotLock.findOne({ date, startTime });
    if (!lock) {
      return res.status(400).json({ message: 'Lock expired or invalid. Please try again.' });
    }

    // 2. Create Appointment
    const appointment = await Appointment.create({
      ...patientData,
      date,
      startTime,
      status: 'PENDING'
    });

    // 3. Remove the lock
    await SlotLock.deleteOne({ _id: lock._id });

    res.status(201).json({ 
      message: 'Appointment confirmed successfully', 
      appointment 
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Slot was booked by someone else during this process' });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = { lockSlot, confirmBooking };
