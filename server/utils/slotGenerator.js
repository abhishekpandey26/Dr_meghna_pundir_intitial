/**
 * Generates an array of time slot strings based on clinic configuration.
 * @param {string} start "09:00"
 * @param {string} end "19:30"
 * @param {number} duration 30
 * @returns {string[]} ["09:00 AM", "09:30 AM", ...]
 */
const generateSlots = (start, end, duration) => {
  const slots = [];
  const startMins = parseToMins(start);
  const endMins = parseToMins(end);

  let current = startMins;
  while (current + duration <= endMins) {
    slots.push(formatMinsToTime(current));
    current += duration;
  }
  return slots;
};

const parseToMins = (hStr) => {
  const [h, m] = hStr.split(':').map(Number);
  return h * 60 + m;
};

const formatMinsToTime = (total) => {
  let h = Math.floor(total / 60);
  const m = total % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
};

module.exports = { generateSlots };
