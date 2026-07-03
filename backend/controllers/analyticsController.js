const Appointment = require('../models/Appointment');

// Helper: format date as YYYY-MM-DD in local time
const formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper: convert MMM DD (e.g. "Jun 13") to YYYY-MM-DD
const convertToYYYYMMDD = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const currentYear = now.getFullYear();
  let date = new Date(`${dateStr} ${currentYear}`);
  if (isNaN(date.getTime())) return '';
  
  if (now.getMonth() === 0 && date.getMonth() === 11) {
    date.setFullYear(currentYear - 1);
  } else if (now.getMonth() === 11 && date.getMonth() === 0) {
    date.setFullYear(currentYear + 1);
  }
  return formatDate(date);
};

// GET /api/analytics/overview
// Returns: today income, month income, total appointments, etc.
const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const todayStr = formatDate(now);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthStartStr = formatDate(monthStart);
    const monthEndStr = formatDate(monthEnd);

    const all = await Appointment.find({});
    
    // Map database date format ("Jun 13") to "YYYY-MM-DD" for accurate analytics filtering
    const allMapped = all.map(a => {
      const formattedDate = convertToYYYYMMDD(a.date);
      return {
        ...a.toObject(),
        formattedDate
      };
    });

    const confirmed = allMapped.filter(a => ['CONFIRMED', 'COMPLETED'].includes(a.status));
    
    // Income calculations (₹500 per consultation as default)
    const CONSULTATION_FEE = 500;
    const todayAppts = confirmed.filter(a => a.formattedDate === todayStr);
    const monthAppts = confirmed.filter(a => a.formattedDate >= monthStartStr && a.formattedDate <= monthEndStr);

    // Daily income for current month (for sparkline chart)
    const dailyIncomeMap = {};
    for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
      const key = formatDate(new Date(d));
      dailyIncomeMap[key] = 0;
    }
    monthAppts.forEach(a => {
      if (dailyIncomeMap[a.formattedDate] !== undefined) {
        dailyIncomeMap[a.formattedDate] += CONSULTATION_FEE;
      }
    });

    const dailyIncome = Object.entries(dailyIncomeMap).map(([date, income]) => ({
      date: date.slice(5), // MM-DD
      income
    }));

    // Treatment breakdown for pie chart
    const treatmentMap = {};
    all.forEach(a => {
      const t = a.treatment || 'Other';
      treatmentMap[t] = (treatmentMap[t] || 0) + 1;
    });
    const treatmentBreakdown = Object.entries(treatmentMap).map(([name, value]) => ({ name, value }));

    // Status breakdown
    const statusMap = {};
    all.forEach(a => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });

    // Last 7 days bookings
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const weeklyData = [];
    for (let d = new Date(sevenDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const key = formatDate(new Date(d));
      const dayAppts = allMapped.filter(a => a.formattedDate === key);
      weeklyData.push({
        day: new Date(key).toLocaleDateString('en-US', { weekday: 'short' }),
        bookings: dayAppts.length,
        confirmed: dayAppts.filter(a => ['CONFIRMED', 'COMPLETED'].includes(a.status)).length
      });
    }

    res.json({
      todayIncome: todayAppts.length * CONSULTATION_FEE,
      monthIncome: monthAppts.length * CONSULTATION_FEE,
      totalAppointments: all.length,
      todayAppointments: todayAppts.length,
      pendingAppointments: all.filter(a => a.status === 'PENDING').length,
      completedAppointments: all.filter(a => a.status === 'COMPLETED').length,
      dailyIncome,
      treatmentBreakdown,
      statusBreakdown: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
      weeklyData,
      consultationFee: CONSULTATION_FEE
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getOverview };
