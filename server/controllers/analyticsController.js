const Appointment = require('../models/Appointment');

// Helper: format date as YYYY-MM-DD
const formatDate = (d) => d.toISOString().split('T')[0];

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
    const confirmed = all.filter(a => ['CONFIRMED', 'COMPLETED'].includes(a.status));
    
    // Income calculations (₹500 per consultation as default)
    const CONSULTATION_FEE = 500;
    const todayAppts = confirmed.filter(a => a.date === todayStr);
    const monthAppts = confirmed.filter(a => a.date >= monthStartStr && a.date <= monthEndStr);

    // Daily income for current month (for sparkline chart)
    const dailyIncomeMap = {};
    for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
      const key = formatDate(new Date(d));
      dailyIncomeMap[key] = 0;
    }
    monthAppts.forEach(a => {
      if (dailyIncomeMap[a.date] !== undefined) {
        dailyIncomeMap[a.date] += CONSULTATION_FEE;
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
      const dayAppts = all.filter(a => a.date === key);
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
