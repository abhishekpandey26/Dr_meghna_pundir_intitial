import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  useApp 
} from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Download, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Trash2,
  Video,
  TrendingUp,
  IndianRupee,
  Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { CLINIC_HOUR_OPTIONS, SLOT_DURATION_OPTIONS } from '../initialData';

export const AdminView: React.FC = () => {
  const { 
    setView, 
    appointments, 
    fetchAppointments,
    updateAppointmentStatus, 
    deleteAppointment,
    addAppointment,
    clinicConfig, 
    updateClinicConfig,
    blockedDates,
    toggleBlockedDate,
    holidays,
    toggleHoliday,
    emergencyClosed,
    setEmergencyClosed,
    adminSearchQuery,
    setAdminSearchQuery,
    setIsAuthenticated,
    galleryItems,
    addGalleryItem,
    removeGalleryItem,
    reels,
    addReel,
    removeReel,
    totalPages: serverTotalPages,
    totalRecords
  } = useApp();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'schedule' | 'gallery' | 'insights' | 'settings'>(() => {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'appointments', 'schedule', 'gallery', 'insights', 'settings'].includes(hash)) {
      return hash as any;
    }
    return 'dashboard';
  });

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/analytics/overview');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics fetch failed:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const itemsPerPage = 10;

  // Fetch recent patients for dashboard, paginated list for registry
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchAppointments({ page: 1, limit: 6, status: 'all' });
    } else if (activeTab === 'appointments') {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage,
        search: adminSearchQuery,
        sortBy: 'createdAt',
        order: 'desc',
      };
      if (statusFilter === 'paid' || statusFilter === 'pending') {
        params.payment = statusFilter;
      } else if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      fetchAppointments(params);
    }
  }, [activeTab, currentPage, statusFilter, adminSearchQuery]);

  // Modal States
  const [showNewApptModal, setShowNewApptModal] = useState(false);
  const [showNewGalleryModal, setShowNewGalleryModal] = useState(false);
  const [showNewReelModal, setShowNewReelModal] = useState(false);
  const [showToast, setShowToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Form States
  const [newAppt, setNewAppt] = useState({
    name: '',
    treatment: 'Acne Therapy',
    time: '10:00 AM',
    date: 'Oct 15',
    mobile: '',
    age: '25'
  });

  const [newGallery, setNewGallery] = useState({ title: '', url: '' });
  const [newReel, setNewReel] = useState({ title: '', coverImage: '', videoUrl: '', type: 'smart_display' as 'photo_camera' | 'smart_display' });

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ msg, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('landing');
  };

  const StatCard = ({ icon: Icon, title, value, trend, color }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm flex flex-col justify-between h-full"
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-serif font-bold text-neutral-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-neutral-900 selection:bg-emerald-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col sticky top-0 h-screen z-40">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center">
              <Stethoscope className="text-emerald-50 w-6 h-6" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tighter text-emerald-900">XELIX</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
            { id: 'appointments', icon: Users, label: 'Patient Registry' },
            { id: 'schedule', icon: Calendar, label: 'Schedule Hub' },
            { id: 'gallery', icon: ImageIcon, label: 'Digital Gallery' },
            { id: 'insights', icon: Video, label: 'Clinical Insights' },
            { id: 'settings', icon: Settings, label: 'Clinic Config' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/10' 
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-emerald-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-200' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="text-sm font-bold uppercase tracking-widest leading-none mt-0.5">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-neutral-100">
          <div className="bg-emerald-50 p-4 rounded-2xl mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center text-[10px] text-white font-bold">DR</div>
              <div>
                <p className="text-xs font-bold text-emerald-900 leading-tight">Dr. Megha Singh</p>
                <p className="text-[10px] text-emerald-700 font-medium opacity-75 leading-tight">Administrator</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-serif font-bold text-neutral-900 capitalize">
              {activeTab === 'dashboard' ? 'Practice Overview' : activeTab === 'insights' ? 'Clinical Insights' : activeTab}
            </h2>
            <div className="h-4 w-[1px] bg-neutral-200 mx-2" />
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search patient, ID, or case..."
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                className="bg-neutral-50 border-none rounded-2xl py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-emerald-900/5 transition-all w-80 outline-none font-medium"
              />
            </div>
            <button 
              onClick={() => setView('landing')}
              className="text-[10px] font-bold text-neutral-500 hover:text-emerald-900 uppercase tracking-[0.2em] transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Lobby
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-10 max-w-7xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                {/* Header */}
                <div>
                  <h2 className="font-serif text-3xl font-bold text-neutral-900">Practice Overview</h2>
                  <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-1">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {/* Today's Income */}
                  <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-emerald-900 to-emerald-700 p-6 rounded-[24px] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full" />
                    <IndianRupee className="w-5 h-5 text-emerald-300 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Today's Income</p>
                    <p className="text-3xl font-serif font-bold mt-1">
                      {analyticsLoading ? '...' : `₹${(analytics?.todayIncome || 0).toLocaleString('en-IN')}`}
                    </p>
                    <p className="text-[10px] text-emerald-200/70 mt-2">{analytics?.todayAppointments || 0} consultations today</p>
                  </motion.div>

                  {/* Month Income */}
                  <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-violet-700 to-purple-900 p-6 rounded-[24px] text-white shadow-xl shadow-violet-900/20 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full" />
                    <TrendingUp className="w-5 h-5 text-violet-300 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">This Month</p>
                    <p className="text-3xl font-serif font-bold mt-1">
                      {analyticsLoading ? '...' : `₹${(analytics?.monthIncome || 0).toLocaleString('en-IN')}`}
                    </p>
                    <p className="text-[10px] text-violet-200/70 mt-2">{analytics?.consultationFee ? `₹${analytics.consultationFee} per session` : ''}</p>
                  </motion.div>

                  {/* Total Appointments */}
                  <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-neutral-50 rounded-full" />
                    <Users className="w-5 h-5 text-blue-500 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Total Patients</p>
                    <p className="text-3xl font-serif font-bold mt-1 text-neutral-900">
                      {analyticsLoading ? '...' : (analytics?.totalAppointments || 0)}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-2">{analytics?.completedAppointments || 0} completed</p>
                  </motion.div>

                  {/* Pending */}
                  <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-neutral-50 rounded-full" />
                    <Activity className="w-5 h-5 text-amber-500 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Pending Review</p>
                    <p className="text-3xl font-serif font-bold mt-1 text-neutral-900">
                      {analyticsLoading ? '...' : (analytics?.pendingAppointments || 0)}
                    </p>
                    <p className="text-[10px] text-amber-500 mt-2 font-bold">Requires attention</p>
                  </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Weekly Bookings Bar Chart */}
                  <div className="lg:col-span-2 bg-white rounded-[24px] border border-neutral-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-neutral-900">Weekly Bookings</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">Last 7 days activity</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics?.weeklyData || []} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontSize: 12 }}
                          cursor={{ fill: '#f9fafb' }}
                        />
                        <Bar dataKey="bookings" name="Total" fill="#d1fae5" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="confirmed" name="Confirmed" fill="#065f46" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Treatment Pie Chart */}
                  <div className="bg-white rounded-[24px] border border-neutral-100 p-6 shadow-sm">
                    <h3 className="font-serif text-lg font-bold text-neutral-900 mb-1">Treatment Mix</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">By category</p>
                    {analytics?.treatmentBreakdown?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={analytics.treatmentBreakdown}
                            cx="50%" cy="50%"
                            innerRadius={55} outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {analytics.treatmentBreakdown.map((_: any, index: number) => (
                              <Cell key={index} fill={['#065f46','#10b981','#34d399','#6ee7b7','#a7f3d0','#d1fae5'][index % 6]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-neutral-300 text-sm font-bold">No data yet</div>
                    )}
                  </div>
                </div>

                {/* Monthly Income Sparkline + Recent Patients */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Monthly Income Trend */}
                  <div className="lg:col-span-2 bg-white rounded-[24px] border border-neutral-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-neutral-900">Monthly Income Trend</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">{new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="bg-emerald-50 px-4 py-2 rounded-xl">
                        <p className="text-emerald-900 font-bold text-sm">₹{(analytics?.monthIncome || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={analytics?.dailyIncome || []}>
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#065f46" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#065f46" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          contentStyle={{ borderRadius: 16, border: '1px solid #f3f4f6', fontSize: 12 }}
                          formatter={(val: any) => [`₹${val}`, 'Income']}
                        />
                        <Area type="monotone" dataKey="income" stroke="#065f46" strokeWidth={2.5} fill="url(#incomeGradient)" dot={false} activeDot={{ r: 5, fill: '#065f46' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recent Patients */}
                  <div className="bg-white rounded-[24px] border border-neutral-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg font-bold text-neutral-900">Recent Patients</h3>
                      <button
                        onClick={() => {
                          setCurrentPage(1);
                          setStatusFilter('all');
                          setActiveTab('appointments');
                        }}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {appointments.slice(0, 6).map((appt) => (
                        <div key={appt._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs flex-none uppercase">
                            {appt.patientName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-neutral-900 truncate">{appt.patientName}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{appt.treatment}</p>
                          </div>
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex-none ${
                            appt.status === 'CONFIRMED' || appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 
                            appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>{appt.status}</span>
                        </div>
                      ))}
                      {appointments.length === 0 && (
                        <p className="text-neutral-300 text-sm text-center py-8 font-bold">No appointments yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Control */}
                <div className="bg-emerald-900 rounded-[24px] p-6 text-white flex items-center justify-between relative overflow-hidden shadow-xl">
                  <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Emergency Control</p>
                    <h4 className="text-xl font-serif font-bold mt-1">
                      {emergencyClosed ? '🔴 Clinic CLOSED — Emergency Mode Active' : '🟢 Clinic OPEN — All Systems Normal'}
                    </h4>
                    <p className="text-xs text-emerald-100/60 mt-1">XELIX Clinic Node • Varanasi</p>
                  </div>
                  <button
                    onClick={() => setEmergencyClosed(!emergencyClosed)}
                    className={`flex-none px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                      emergencyClosed ? 'bg-white text-emerald-900 hover:bg-emerald-50' : 'border border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    {emergencyClosed ? 'Lift Lockdown' : 'Initiate Lockdown'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div 
                key="appointments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-3xl font-bold">Patient Registry</h3>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">{totalRecords} total cases registered</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-2xl px-4 py-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Filter:</span>
                      <select 
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="text-xs font-bold text-neutral-900 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="all">All Records</option>
                        <option value="paid">Paid (Confirmed + Completed)</option>
                        <option value="pending">Pending (Unpaid / Awaiting)</option>
                        <option value="CONFIRMED">Confirmed Only</option>
                        <option value="PENDING">Pending Approval</option>
                        <option value="COMPLETED">Successfully Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="PAYMENT_PENDING">Awaiting Payment</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => triggerToast('Generating System Export...')}
                      className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-all"
                      title="Export Data"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={() => setShowNewApptModal(true)}
                      className="bg-emerald-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20"
                    >
                      <Plus className="w-5 h-5" />
                      Add Entry
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden whitespace-nowrap">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b border-neutral-100">
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Patient Details</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Treatment Path</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Session Slot</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Protocol Level</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {appointments.map((appt) => (
                        <tr key={appt._id} className="group hover:bg-neutral-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-extrabold text-xs">
                                {appt.patientName?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-neutral-900">{appt.patientName || 'Incognito Guest'}</p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{appt.patientId || 'NO-ID'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-lg">
                              {appt.treatment}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="inline-flex items-center gap-2 text-neutral-600">
                              <Clock className="w-4 h-4 text-neutral-300" />
                              <span className="text-xs font-bold">{appt.startTime || appt.time}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`text-[9px] font-extrabold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border ${
                              appt.status === 'CONFIRMED' || appt.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' 
                              : 'bg-neutral-50 text-neutral-400 border-neutral-100'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    updateAppointmentStatus(appt._id!, 'CONFIRMED');
                                    triggerToast(`Status for ${appt.patientName} updated to PAID.`);
                                  }}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                  title="Mark as Paid"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to purge this clinical record?')) {
                                    deleteAppointment(appt._id!);
                                    triggerToast('Record purged from XELIX Central.', 'error');
                                  }
                                }}
                                className="p-2 text-neutral-300 hover:text-rose-600 rounded-xl transition-colors"
                                title="Purge Record"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-neutral-400 font-bold text-sm bg-neutral-50/30">
                            No matching patient records discovered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
 
                  {/* Server-Side Pagination */}
                  <div className="px-8 py-6 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/30">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Showing {appointments.length} of {totalRecords} records — page {currentPage} of {serverTotalPages || 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex gap-1">
                        {[...Array(serverTotalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all ${
                              currentPage === i + 1 
                              ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/10' 
                              : 'text-neutral-400 hover:bg-white border border-transparent hover:border-neutral-200'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(serverTotalPages, p + 1))}
                        disabled={currentPage === serverTotalPages}
                        className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-serif text-3xl font-bold">Schedule Hub</h3>
                  <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Manage Doctor Availability & Time Off</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  {/* Calendar for blocking dates */}
                  <div className="bg-white p-10 rounded-[40px] border border-neutral-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-rose-600" />
                        </div>
                        <h4 className="font-bold text-neutral-900">Block Clinical Dates</h4>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">June 2026</span>
                    </div>

                    <div className="space-y-6">
                      <p className="text-xs text-neutral-500 leading-relaxed font-medium">Click on a date to toggle "Doctor Off" status. Blocked dates will be instantly disabled in the patient booking portal.</p>
                      
                      <div className="grid grid-cols-7 gap-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                          <div key={d} className="text-[10px] font-bold text-neutral-300 text-center py-2">{d}</div>
                        ))}
                        {[...Array(30)].map((_, i) => {
                          const dayNum = i + 1;
                          const dateStr = `Jun ${dayNum < 10 ? '0' + dayNum : dayNum}`;
                          const isBlocked = blockedDates.includes(dateStr);
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                toggleBlockedDate(dateStr);
                                triggerToast(isBlocked ? `Date ${dateStr} is now active.` : `Doctor taking off on ${dateStr}.`, isBlocked ? 'success' : 'error');
                              }}
                              className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-bold transition-all relative ${
                                isBlocked 
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
                                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {dayNum}
                              {isBlocked && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-6 bg-neutral-50 rounded-[24px] flex items-center gap-4 border border-neutral-100">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white" />
                        <div className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-900 uppercase">Legend</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Blocked (Off) vs Consultative Date</p>
                      </div>
                    </div>
                  </div>

                  {/* Holidays management */}
                  <div className="space-y-8">
                    <div className="bg-emerald-900 p-10 rounded-[40px] text-white">
                      <h4 className="font-serif text-xl font-bold mb-4">Recurring Festive Holidays</h4>
                      <div className="space-y-4">
                        {['Diwali', 'Holi', 'Independence Day', 'Christmas', 'New Year'].map(holiday => {
                          const isActive = holidays.includes(holiday);
                          return (
                            <button 
                              key={holiday}
                              onClick={() => {
                                toggleHoliday(holiday);
                                triggerToast(`${holiday} status synchronized.`);
                              }}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                                isActive ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent opacity-50 hover:opacity-100'
                              }`}
                            >
                              <span className="text-sm font-bold">{holiday}</span>
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? 'bg-emerald-400' : 'bg-white/20'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-neutral-100 border-dashed flex flex-col items-center justify-center text-center gap-4 py-16">
                      <div className="p-4 bg-neutral-50 rounded-3xl">
                        <HelpCircle className="w-8 h-8 text-neutral-300" />
                      </div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Schedule Analytics</p>
                      <p className="text-[10px] text-neutral-300 font-medium max-w-xs uppercase tracking-wider leading-relaxed">
                        Data harvesting for patient influx vs sabbatical frequency is restricted to Clinical Level 4.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div 
                key="gallery"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-serif text-3xl font-bold">Visual Assets</h3>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Clinic Showcase Management</p>
                  </div>
                  <button 
                    onClick={() => setShowNewGalleryModal(true)}
                    className="bg-emerald-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Upload Image
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryItems.map((item) => (
                    <div key={item._id} className="group relative bg-white rounded-[24px] overflow-hidden border border-neutral-100 shadow-sm">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs text-neutral-900">{item.title}</p>
                          <p className="text-[9px] text-neutral-400 uppercase font-extrabold tracking-widest mt-1">Live Portfolio</p>
                        </div>
                        <button 
                          onClick={() => {
                            removeGalleryItem(item._id);
                            triggerToast('Asset removed from portfolio.');
                          }}
                          className="p-2 hover:bg-rose-50 rounded-xl text-neutral-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors pointer-events-none" />
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowNewGalleryModal(true)}
                    className="aspect-[4/3] rounded-[24px] border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-3 hover:border-emerald-900/30 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="p-3 rounded-2xl bg-neutral-100 group-hover:bg-emerald-100 transition-colors">
                      <Plus className="w-6 h-6 text-neutral-400 group-hover:text-emerald-900" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-emerald-900">Add New Photo</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div 
                key="insights"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-serif text-3xl font-bold">Clinical Insights</h3>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Video Content & YouTube Shorts</p>
                  </div>
                  <button 
                    onClick={() => setShowNewReelModal(true)}
                    className="bg-emerald-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Video Link
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {reels.map((reel) => (
                    <div key={reel._id} className="group relative bg-white rounded-[24px] overflow-hidden border border-neutral-100 shadow-sm">
                      <div className="aspect-[9/16] overflow-hidden relative">
                        <img 
                          src={reel.coverImage} 
                          alt={reel.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Video className="text-white w-12 h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-xs text-neutral-900 line-clamp-1">{reel.title}</p>
                            <p className="text-[9px] text-neutral-400 uppercase font-extrabold tracking-widest mt-1">Insights Reel</p>
                          </div>
                          <button 
                            onClick={() => {
                              removeReel(reel._id!);
                              triggerToast('Video content removed.');
                            }}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowNewReelModal(true)}
                    className="aspect-[9/16] rounded-[24px] border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-3 hover:border-emerald-900/30 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="p-3 rounded-2xl bg-neutral-100 group-hover:bg-emerald-100 transition-colors">
                      <Plus className="w-6 h-6 text-neutral-400 group-hover:text-emerald-900" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-emerald-900">Add YouTube Short</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-4xl space-y-10"
              >
                <div>
                  <h3 className="font-serif text-3xl font-bold">Clinic Configuration</h3>
                  <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Core Practice Parameters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* General Working Hours */}
                  <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 rounded-2xl">
                        <Clock className="w-6 h-6 text-emerald-900" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">Standard Consulting Hours</h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Active Schedule</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Daily Start</label>
                          <select 
                            value={clinicConfig.startHour}
                            onChange={(e) => updateClinicConfig({ ...clinicConfig, startHour: e.target.value })}
                            className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold outline-none ring-1 ring-neutral-200 focus:ring-emerald-900/20"
                          >
                            {CLINIC_HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Daily Close</label>
                          <select 
                            value={clinicConfig.endHour}
                            onChange={(e) => updateClinicConfig({ ...clinicConfig, endHour: e.target.value })}
                            className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold outline-none ring-1 ring-neutral-200 focus:ring-emerald-900/20"
                          >
                            {CLINIC_HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Slot Duration Strategy</label>
                        <select 
                          value={clinicConfig.slotDuration}
                          onChange={(e) => updateClinicConfig({ ...clinicConfig, slotDuration: Number(e.target.value) })}
                          className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold outline-none ring-1 ring-neutral-200 focus:ring-emerald-900/20"
                        >
                          {SLOT_DURATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* System State */}
                  <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-50 rounded-2xl">
                        <ShieldCheck className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">Safety & Compliance</h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Global Overrides</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-rose-900">Emergency Lockdown</p>
                            <p className="text-[9px] text-rose-700/70 font-bold uppercase mt-0.5">Restrict all public slots</p>
                          </div>
                          <button 
                            onClick={() => {
                              setEmergencyClosed(!emergencyClosed);
                              triggerToast(emergencyClosed ? 'Clinic active.' : 'Emergency lockdown active.', emergencyClosed ? 'success' : 'error');
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${emergencyClosed ? 'bg-rose-600' : 'bg-neutral-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${emergencyClosed ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 border border-neutral-100 rounded-[24px] space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Technical Intelligence</p>
                        <p className="text-xs font-medium text-neutral-600 leading-relaxed">System architecture operating at Varanasi SAMNE GHAT node. All transactions and patient records are encrypted via Dermelixir Cloud Protocol.</p>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-900 hover:gap-3 transition-all">
                          Contact Engineering <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 ${
              showToast.type === 'success' ? 'bg-emerald-900 text-white' : 'bg-rose-900 text-white'
            }`}
          >
            {showToast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-300" />}
            <span className="text-xs font-bold uppercase tracking-widest">{showToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Appointment Modal */}
      <AnimatePresence>
        {showNewApptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewApptModal(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Walk-in Hub</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Instant Patient Registration</p>
                  </div>
                  <button onClick={() => setShowNewApptModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  addAppointment({
                    patientName: newAppt.name,
                    patientAvatar: '',
                    treatment: newAppt.treatment,
                    time: newAppt.time,
                    date: newAppt.date,
                    mobile: newAppt.mobile || '+91 91100 22334',
                    email: 'walkin@dermelixir.com',
                    age: parseInt(newAppt.age)
                  });
                  setShowNewApptModal(false);
                  triggerToast('Patient registered and slot assigned.');
                }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Legal Full Name</label>
                      <input 
                        required type="text" value={newAppt.name}
                        onChange={(e) => setNewAppt({...newAppt, name: e.target.value})}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Case Age</label>
                      <input 
                        required type="number" value={newAppt.age}
                        onChange={(e) => setNewAppt({...newAppt, age: e.target.value})}
                        placeholder="25"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Involved Service</label>
                      <select 
                        value={newAppt.treatment}
                        onChange={(e) => setNewAppt({...newAppt, treatment: e.target.value})}
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      >
                        <option>Acne Therapy</option>
                        <option>Laser Resurfacing</option>
                        <option>Hair Restoration</option>
                        <option>Hydrafacial Deluxe</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Assigned Time Slot</label>
                      <input 
                        required type="text" value={newAppt.time}
                        onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                        placeholder="10:00 AM"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4"
                  >
                    Generate Appointment
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Gallery Item Modal */}
      <AnimatePresence>
        {showNewGalleryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewGalleryModal(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Add Portfolio Item</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Clinic Showcase Update</p>
                  </div>
                  <button onClick={() => setShowNewGalleryModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  addGalleryItem(newGallery);
                  setNewGallery({ title: '', url: '' });
                  setShowNewGalleryModal(false);
                  triggerToast('Asset integrated into showcase.');
                }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Asset Title</label>
                    <input 
                      required type="text" value={newGallery.title}
                      onChange={(e) => setNewGallery({...newGallery, title: e.target.value})}
                      placeholder="e.g. VIP Treatment Wing"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Image Endpoint (URL)</label>
                    <input 
                      required type="url" value={newGallery.url}
                      onChange={(e) => setNewGallery({...newGallery, url: e.target.value})}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4"
                  >
                    Authorize Integration
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Insight Reel Modal */}
      <AnimatePresence>
        {showNewReelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewReelModal(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Add Clinical Insight</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Dermatological Video Channel</p>
                  </div>
                  <button onClick={() => setShowNewReelModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  addReel(newReel);
                  setNewReel({ title: '', coverImage: '', videoUrl: '', type: 'smart_display' });
                  setShowNewReelModal(false);
                  triggerToast('Content added to Insight channel.');
                }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Reel Title</label>
                    <input 
                      required type="text" value={newReel.title}
                      onChange={(e) => setNewReel({...newReel, title: e.target.value})}
                      placeholder="e.g. PRP Therapy Benefits"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Cover Asset (URL)</label>
                    <input 
                      required type="url" value={newReel.coverImage}
                      onChange={(e) => setNewReel({...newReel, coverImage: e.target.value})}
                      placeholder="YouTube Thumbnail or Source Image"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Video Link (YouTube/Instagram)</label>
                    <input 
                      required type="url" value={newReel.videoUrl}
                      onChange={(e) => setNewReel({...newReel, videoUrl: e.target.value})}
                      placeholder="https://www.youtube.com/shorts/... or Insta reel link"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Interaction Type</label>
                    <select 
                      value={newReel.type}
                      onChange={(e) => setNewReel({...newReel, type: e.target.value as any})}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    >
                      <option value="smart_display">Video Playback (YouTube Short/Instagram)</option>
                      <option value="photo_camera">Clinical Snapshot</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4"
                  >
                    Dispatch to Live Channel
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
