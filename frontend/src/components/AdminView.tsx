import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  useApp
} from '../context/AppContext';
import { API_BASE } from '../config';
import { BlogPost } from '../types';
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
  Instagram,
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
  Edit,
  TrendingUp,
  IndianRupee,
  Activity,
  Sparkles,
  Columns,
  Newspaper,
  MessageSquare,
  Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { CLINIC_HOUR_OPTIONS, SLOT_DURATION_OPTIONS } from '../initialData';

const getMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const serverBase = API_BASE.replace('/api', '');
    return `${serverBase}${url}`;
  }
  return url;
};

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
    updateGalleryItem,
    reels,
    addReel,
    removeReel,
    updateReel,
    beforeAfterItems,
    addBeforeAfter,
    deleteBeforeAfter,
    skinLeads,
    fetchSkinLeads,
    deleteSkinLead,
    updateSkinLeadStatus,
    totalPages: serverTotalPages,
    totalRecords,
    blogs,
    addBlogPost,
    deleteBlogPost,
    updateBlogPost,
    videoTestimonials,
    addVideoTestimonial,
    deleteVideoTestimonial,
    updateVideoTestimonial,
    photoTestimonials,
    addPhotoTestimonial,
    deletePhotoTestimonial,
    updatePhotoTestimonial
  } = useApp();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'schedule' | 'gallery' | 'beforeafter' | 'skinleads' | 'insights' | 'settings' | 'blogs' | 'testimonials' | 'instagram'>(() => {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'appointments', 'schedule', 'gallery', 'beforeafter', 'skinleads', 'insights', 'settings', 'blogs', 'testimonials', 'instagram'].includes(hash)) {
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
        const res = await fetch(`${API_BASE}/analytics/overview`);
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
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>(() => {
    return (sessionStorage.getItem('dermelixir_admin_date_filter') as 'today' | 'all') || 'today';
  });
  const [sortBy, setSortBy] = useState<'createdAt' | 'date'>(() => {
    return (sessionStorage.getItem('dermelixir_admin_sort_by') as 'createdAt' | 'date') || 'date';
  });
  const [selectedApptDetail, setSelectedApptDetail] = useState<any | null>(null);
  const itemsPerPage = 10;

  // Fetch recent patients for dashboard, paginated list for registry
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchAppointments({ page: 1, limit: 6, status: 'all' });
    } else if (activeTab === 'appointments') {
      const today = new Date();
      const month = today.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = today.getDate();
      const todayStr = `${month} ${dayNum < 10 ? '0' + dayNum : dayNum}`;

      const params: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage,
        search: adminSearchQuery,
        sortBy: sortBy,
        order: sortBy === 'date' ? 'asc' : 'desc',
      };

      if (dateFilter === 'today') {
        params.date = todayStr;
      } else {
        params.date = 'all'; // Explicitly override previous cached date parameter in AppContext
      }

      if (statusFilter === 'paid' || statusFilter === 'pending') {
        params.payment = statusFilter;
        params.status = 'all';
      } else if (statusFilter !== 'all') {
        params.status = statusFilter;
        params.payment = 'all';
      } else {
        params.status = 'all';
        params.payment = 'all';
      }
      fetchAppointments(params);
    }
  }, [activeTab, currentPage, statusFilter, adminSearchQuery, dateFilter, sortBy]);

  useEffect(() => {
    if (activeTab === 'skinleads') {
      fetchSkinLeads();
    }
  }, [activeTab]);

  // Modal States
  const [showNewApptModal, setShowNewApptModal] = useState(false);
  const [showNewGalleryModal, setShowNewGalleryModal] = useState(false);
  const [showEditGalleryModal, setShowEditGalleryModal] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<{ _id?: string, title: string, url: string, order?: number } | null>(null);
  const [showNewReelModal, setShowNewReelModal] = useState(false);
  const [showEditReelModal, setShowEditReelModal] = useState(false);
  const [editingReel, setEditingReel] = useState<{ _id?: string, title: string, coverImage: string, videoUrl: string, type: 'photo_camera' | 'smart_display' } | null>(null);
  const [showNewBlogModal, setShowNewBlogModal] = useState(false);
  const [showEditBlogModal, setShowEditBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // Testimonials States
  const [activeTestimonialSubTab, setActiveTestimonialSubTab] = useState<'videos' | 'photos'>('videos');
  const [showNewVideoModal, setShowNewVideoModal] = useState(false);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [newVideo, setNewVideo] = useState({ title: '', youtubeUrl: '', category: 'General', order: 0 });

  const [showNewPhotoModal, setShowNewPhotoModal] = useState(false);
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [newPhoto, setNewPhoto] = useState({ title: '', treatment: 'Skin Treatment', beforeUrl: '', afterUrl: '', description: '', order: 0 });

  // Instagram Feed States
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [instagramUrlInput, setInstagramUrlInput] = useState('');
  const [instagramMediaTypeInput, setInstagramMediaTypeInput] = useState<'image' | 'reel'>('image');
  const [instagramCaptionInput, setInstagramCaptionInput] = useState('');
  const [instagramOrderInput, setInstagramOrderInput] = useState(0);
  const [instagramIsPublishedInput, setInstagramIsPublishedInput] = useState(true);
  const [instagramFile, setInstagramFile] = useState<File | null>(null);

  const fetchInstagramPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/instagram-posts/admin`);
      const data = await res.json();
      setInstagramPosts(data || []);
    } catch (err) {
      console.error('Failed to fetch Instagram posts', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'instagram') {
      fetchInstagramPosts();
    }
  }, [activeTab]);

  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    image: '',
    category: 'Skincare Treatment',
    author: 'Dr. Megha Pundir Singh',
    dateString: ''
  });

  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [editBlogImageFile, setEditBlogImageFile] = useState<File | null>(null);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const [showToast, setShowToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  // Form States
  const [newAppt, setNewAppt] = useState({
    name: '',
    treatment: 'Acne Therapy',
    time: '10:00 AM',
    date: new Date().toISOString().split('T')[0],
    mobile: '',
    email: '',
    age: '25'
  });

  const [newGallery, setNewGallery] = useState<{ title: string, url: string, order: string }>({ title: '', url: '', order: '' });
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

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto hide-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
            { id: 'appointments', icon: Users, label: 'Patient Registry' },
            { id: 'schedule', icon: Calendar, label: 'Schedule Hub' },
            { id: 'gallery', icon: ImageIcon, label: 'Digital Gallery' },
            { id: 'beforeafter', icon: Columns, label: 'Before & After' },
            { id: 'skinleads', icon: Sparkles, label: 'Skin Scan Leads' },
            { id: 'insights', icon: Video, label: 'Clinical Insights' },
            { id: 'blogs', icon: Newspaper, label: 'Manage Blogs' },
            { id: 'testimonials', icon: MessageSquare, label: 'Testimonials' },
            { id: 'instagram', icon: Instagram, label: 'Instagram Feed' },
            { id: 'settings', icon: Settings, label: 'Clinic Config' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${activeTab === item.id
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
              {activeTab === 'dashboard' ? 'Practice Overview' :
                activeTab === 'insights' ? 'Clinical Insights' :
                  activeTab === 'beforeafter' ? 'Before & After Gallery' :
                    activeTab === 'instagram' ? 'Instagram Feed Hub' :
                      activeTab === 'skinleads' ? 'Skin Scan Leads' : activeTab}
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
                              <Cell key={index} fill={['#065f46', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'][index % 6]} />
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
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex-none ${appt.status === 'CONFIRMED' || appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
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
                    className={`flex-none px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${emergencyClosed ? 'bg-white text-emerald-900 hover:bg-emerald-50' : 'border border-white/20 text-white hover:bg-white/10'
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
                    <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-2xl px-4 py-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Date:</span>
                      <select 
                        value={dateFilter}
                        onChange={(e) => {
                          const val = e.target.value as 'today' | 'all';
                          setDateFilter(val);
                          sessionStorage.setItem('dermelixir_admin_date_filter', val);
                          setCurrentPage(1);
                        }}
                        className="text-xs font-bold text-neutral-900 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="today">Today Only</option>
                        <option value="all">All Dates</option>
                      </select>
                    </div>

                    {/* Sort Selector */}
                    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-2xl px-4 py-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sort By:</span>
                      <select 
                        value={sortBy}
                        onChange={(e) => {
                          const val = e.target.value as 'createdAt' | 'date';
                          setSortBy(val);
                          sessionStorage.setItem('dermelixir_admin_sort_by', val);
                          setCurrentPage(1);
                        }}
                        className="text-xs font-bold text-neutral-900 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="date">Appointment Slot (Time)</option>
                        <option value="createdAt">Registration Date</option>
                      </select>
                    </div>

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
                    </div>                  </div>

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
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{appt.patientId || 'NO-ID'}</span>
                                  {appt.consultationType === 'ONLINE' ? (
                                    <span className="text-[8px] font-extrabold tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> ONLINE
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-extrabold tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100">
                                      IN-CLINIC
                                    </span>
                                  )}
                                  {appt.paymentMethod === 'CLINIC' ? (
                                    <span className="text-[8px] font-extrabold tracking-widest bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100">
                                      PAY AT CLINIC
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-extrabold tracking-widest bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-100">
                                      PAID ONLINE
                                    </span>
                                  )}
                                </div>
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
                            <span className={`text-[9px] font-extrabold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border ${appt.status === 'CONFIRMED' || appt.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-neutral-50 text-neutral-400 border-neutral-100'
                              }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {appt.consultationType === 'ONLINE' && (
                                <button
                                  onClick={() => {
                                    setView('video-room');
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors animate-pulse"
                                  title="Join Video Consultation"
                                >
                                  <Video className="w-5 h-5" />
                                </button>
                              )}
                               <button 
                                onClick={() => {
                                  setSelectedApptDetail(appt);
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                title="View Case Details"
                              >
                                <Eye className="w-5 h-5" />
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
                            className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all ${currentPage === i + 1
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
                              className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-bold transition-all relative ${isBlocked
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
                              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${isActive ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent opacity-50 hover:opacity-100'
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
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-neutral-900/80 backdrop-blur-sm text-white text-[11px] font-extrabold flex items-center justify-center z-10">
                          {item.order ?? 0}
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs text-neutral-900">{item.title}</p>
                          <p className="text-[9px] text-neutral-400 uppercase font-extrabold tracking-widest mt-1">Order #{item.order ?? 0}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingGalleryItem({
                                _id: item._id,
                                title: item.title,
                                url: item.url,
                                order: item.order ?? 0
                              });
                              setShowEditGalleryModal(true);
                            }}
                            className="p-2 hover:bg-emerald-50 rounded-xl text-neutral-400 hover:text-emerald-700 transition-colors"
                            title="Edit Photo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              removeGalleryItem(item._id);
                              triggerToast('Asset removed from portfolio.');
                            }}
                            className="p-2 hover:bg-rose-50 rounded-xl text-neutral-400 hover:text-rose-600 transition-colors"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingReel({
                                  _id: reel._id,
                                  title: reel.title,
                                  coverImage: reel.coverImage,
                                  videoUrl: reel.videoUrl,
                                  type: reel.type
                                });
                                setShowEditReelModal(true);
                              }}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg text-neutral-400 hover:text-emerald-700 transition-colors"
                              title="Edit Insight"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                removeReel(reel._id!);
                                triggerToast('Video content removed.');
                              }}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600 transition-colors"
                              title="Delete Insight"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

            {activeTab === 'beforeafter' && (
              <motion.div
                key="beforeafter"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <h3 className="font-serif text-3xl font-bold">Transformation Gallery</h3>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Manage Before & After Clinical Results</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                  {/* Upload Form */}
                  <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm space-y-6">
                    <h4 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">Upload New Transformation</h4>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const fd = new FormData(form);
                      const title = fd.get('title') as string;
                      const treatment = fd.get('treatment') as string;
                      const beforeUrl = fd.get('beforeUrl') as string;
                      const afterUrl = fd.get('afterUrl') as string;

                      if (!title || !treatment || !beforeUrl || !afterUrl) {
                        return triggerToast('Please fill all fields', 'error');
                      }

                      const isValidUrl = (url: string) => /^https?:\/\/.+/.test(url);
                      if (!isValidUrl(beforeUrl) || !isValidUrl(afterUrl)) {
                        return triggerToast('Before and After images must be valid URLs starting with http:// or https://', 'error');
                      }

                      await addBeforeAfter({ title, treatment, beforeUrl, afterUrl });
                      form.reset();
                      triggerToast('Transformation added successfully!');
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Case Title</label>
                        <input type="text" name="title" required className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5" placeholder="e.g. 4 Weeks Acne Treatment" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Treatment Category</label>
                        <select name="treatment" required className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5 cursor-pointer">
                          <option value="Acne Therapy">Acne Therapy</option>
                          <option value="Laser Resurfacing">Laser Resurfacing</option>
                          <option value="Hair Restoration">Hair Restoration</option>
                          <option value="Medical Consult">Medical Consult</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Before Image URL</label>
                        <input type="url" name="beforeUrl" required className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5" placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">After Image URL</label>
                        <input type="url" name="afterUrl" required className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5" placeholder="https://..." />
                      </div>
                      <button type="submit" className="w-full bg-emerald-900 text-white py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-950 transition-all cursor-pointer">
                        Add to Gallery
                      </button>
                    </form>
                  </div>

                  {/* List Grid - 2 columns */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {beforeAfterItems.map((item) => (
                      <div key={item._id} className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div className="grid grid-cols-2 aspect-[4/3] relative bg-neutral-50">
                          <img src={item.beforeUrl} alt="Before" className="w-full h-full object-cover border-r border-white" />
                          <img src={item.afterUrl} alt="After" className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 left-2 bg-emerald-950/80 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded">Before</div>
                          <div className="absolute bottom-2 right-2 bg-emerald-500/80 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded">After</div>
                        </div>
                        <div className="p-5 flex items-center justify-between">
                          <div>
                            <h5 className="font-serif font-bold text-neutral-900 text-sm truncate max-w-[150px]" title={item.title}>{item.title}</h5>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{item.treatment}</p>
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this transformation record?')) {
                                await deleteBeforeAfter(item._id!);
                                triggerToast('Transformation deleted.', 'error');
                              }
                            }}
                            className="p-2 text-neutral-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {beforeAfterItems.length === 0 && (
                      <div className="sm:col-span-2 p-12 text-center text-neutral-400 font-bold text-xs uppercase bg-white border border-neutral-100 rounded-[24px]">
                        No transformations loaded in the clinic database.
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'blogs' && (
              <motion.div
                key="blogs"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-serif text-3xl font-bold">Manage Blog Posts</h3>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Publish and Edit Clinic Articles</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewBlog({
                        title: '',
                        slug: '',
                        summary: '',
                        content: '',
                        image: '',
                        category: 'Skincare Treatment',
                        author: 'Dr. Megha Pundir Singh',
                        dateString: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
                      });
                      setShowNewBlogModal(true);
                    }}
                    className="bg-emerald-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    New Blog Post
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((post) => (
                    <div key={post._id} className="bg-white rounded-[24px] overflow-hidden border border-neutral-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="aspect-[16/10] overflow-hidden relative bg-neutral-100">
                          <img
                            src={getMediaUrl(post.image)}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-emerald-900 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            {post.category}
                          </div>
                        </div>
                        <div className="p-6 space-y-3">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{post.dateString} &bull; {post.author}</span>
                          <h4 className="font-serif font-bold text-neutral-900 text-lg line-clamp-2 leading-snug">{post.title}</h4>
                          <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed font-medium">{post.summary}</p>
                        </div>
                      </div>
                      <div className="p-6 pt-0 border-t border-neutral-50 flex justify-between items-center mt-4">
                        <button
                          onClick={() => {
                            setView('blog-detail', post.slug);
                          }}
                          className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          View Post <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingBlog(post);
                              setShowEditBlogModal(true);
                            }}
                            className="p-2 bg-neutral-50 hover:bg-emerald-50 rounded-xl text-neutral-400 hover:text-emerald-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this blog post?')) {
                                await deleteBlogPost(post._id!);
                                triggerToast('Blog post deleted successfully.');
                              }
                            }}
                            className="p-2 bg-neutral-50 hover:bg-rose-50 rounded-xl text-neutral-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {blogs.length === 0 && (
                    <div className="col-span-full p-16 text-center bg-white border border-neutral-100 rounded-[24px] text-neutral-400 font-bold text-xs uppercase">
                      No blog posts published in the database.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'testimonials' && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-serif text-3xl font-bold">Manage Testimonials</h3>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Publish Video Reviews &amp; Before/After Results</p>
                  </div>
                  <div className="flex gap-3">
                    {activeTestimonialSubTab === 'videos' ? (
                      <button
                        onClick={() => {
                          setNewVideo({ title: '', youtubeUrl: '', category: 'General', order: 0 });
                          setShowNewVideoModal(true);
                        }}
                        className="bg-emerald-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Plus className="w-5 h-5" /> Add Video Review
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setNewPhoto({ title: '', treatment: 'Skin Treatment', beforeUrl: '', afterUrl: '', description: '', order: 0 });
                          setShowNewPhotoModal(true);
                        }}
                        className="bg-emerald-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Plus className="w-5 h-5" /> Add Before/After Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub Tabs Selection */}
                <div className="flex gap-2 border-b border-neutral-200 pb-px">
                  <button
                    onClick={() => setActiveTestimonialSubTab('videos')}
                    className={`pb-4 px-6 font-bold text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTestimonialSubTab === 'videos'
                        ? 'border-emerald-900 text-emerald-900'
                        : 'border-transparent text-neutral-400 hover:text-neutral-600'
                      }`}
                  >
                    Video Testimonials ({videoTestimonials.length})
                  </button>
                  <button
                    onClick={() => setActiveTestimonialSubTab('photos')}
                    className={`pb-4 px-6 font-bold text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTestimonialSubTab === 'photos'
                        ? 'border-emerald-900 text-emerald-900'
                        : 'border-transparent text-neutral-400 hover:text-neutral-600'
                      }`}
                  >
                    Before &amp; After Photos ({photoTestimonials.length})
                  </button>
                </div>

                {/* VIDEO TESTIMONIALS SUB-TAB */}
                {activeTestimonialSubTab === 'videos' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videoTestimonials.map((video) => {
                      const getYouTubeId = (url: string) => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                        const match = url.match(regExp);
                        return match && match[2].length === 11 ? match[2] : null;
                      };
                      const yId = getYouTubeId(video.youtubeUrl);
                      return (
                        <div key={video._id} className="bg-white rounded-[24px] overflow-hidden border border-neutral-100 shadow-sm flex flex-col justify-between">
                          <div className="aspect-video bg-neutral-100 relative">
                            {yId ? (
                              <img
                                src={`https://img.youtube.com/vi/${yId}/hqdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <Video className="w-8 h-8" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 bg-emerald-900/90 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                              {video.category}
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h4 className="font-bold text-sm text-neutral-900 leading-snug">{video.title}</h4>
                              <p className="text-[10px] text-neutral-400 mt-1 truncate">{video.youtubeUrl}</p>
                              <p className="text-[9px] text-emerald-800 font-bold uppercase tracking-widest mt-2">Display Order: {video.order || 0}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingVideo(video);
                                  setShowEditVideoModal(true);
                                }}
                                className="flex-1 py-2.5 bg-neutral-50 hover:bg-emerald-50 text-neutral-600 hover:text-emerald-900 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this video review?')) {
                                    await deleteVideoTestimonial(video._id!);
                                    triggerToast('Video review deleted successfully.');
                                  }
                                }}
                                className="px-3 bg-neutral-50 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {videoTestimonials.length === 0 && (
                      <div className="col-span-full p-16 text-center bg-white border border-neutral-100 rounded-[24px] text-neutral-400 font-bold text-xs uppercase">
                        No video reviews published in the database.
                      </div>
                    )}
                  </div>
                )}

                {/* BEFORE & AFTER PHOTOS SUB-TAB */}
                {activeTestimonialSubTab === 'photos' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {photoTestimonials.map((photo) => (
                      <div key={photo._id} className="bg-white rounded-[24px] overflow-hidden border border-neutral-100 shadow-sm flex flex-col justify-between">
                        <div className="grid grid-cols-2 aspect-[4/3] bg-neutral-100 border-b border-neutral-50">
                          <img
                            src={photo.beforeUrl}
                            alt="Before"
                            className="w-full h-full object-cover border-r border-neutral-100"
                          />
                          <img
                            src={photo.afterUrl}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-950/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {photo.treatment}
                            </span>
                            <h4 className="font-bold text-sm text-neutral-900 leading-snug mt-2">{photo.title}</h4>
                            {photo.description && (
                              <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">{photo.description}</p>
                            )}
                            <p className="text-[9px] text-emerald-800 font-bold uppercase tracking-widest mt-2">Display Order: {photo.order || 0}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPhoto(photo);
                                setShowEditPhotoModal(true);
                              }}
                              className="flex-1 py-2.5 bg-neutral-50 hover:bg-emerald-50 text-neutral-600 hover:text-emerald-900 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this before/after photo record?')) {
                                  await deletePhotoTestimonial(photo._id!);
                                  triggerToast('Before/After record deleted successfully.');
                                }
                              }}
                              className="px-3 bg-neutral-50 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {photoTestimonials.length === 0 && (
                      <div className="col-span-full p-16 text-center bg-white border border-neutral-100 rounded-[24px] text-neutral-400 font-bold text-xs uppercase">
                        No before/after photo testimonials published in the database.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'skinleads' && (
              <motion.div
                key="skinleads"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-serif text-3xl font-bold">Skin Scan Leads</h3>
                  <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">{skinLeads.length} leads generated from AI Scanner</p>
                </div>

                <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden whitespace-nowrap">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b border-neutral-100">
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Lead Details</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Skin Type & Concern</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Overall Score & Diagnostics</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {skinLeads.map((lead) => (
                        <tr key={lead._id} className="group hover:bg-neutral-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-extrabold text-xs">
                                {lead.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-neutral-900">{lead.name}</p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{lead.email} &bull; {lead.mobile} &bull; Age {lead.age || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div>
                              <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-lg inline-block">
                                {lead.skinType || 'Combination'}
                              </span>
                              <p className="text-[9px] text-emerald-800 font-bold uppercase mt-1">Concern: {lead.primaryConcern || 'None'}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-sm font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
                                Score: {lead.scanResults.overallScore}%
                              </span>
                              <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                                H:{lead.scanResults.hydration}% &bull; R:{lead.scanResults.redness}% &bull; P:{lead.scanResults.pores}% &bull; S:{lead.scanResults.spots}%
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <select
                              value={lead.status}
                              onChange={(e) => {
                                updateSkinLeadStatus(lead._id!, e.target.value);
                                triggerToast(`Lead status updated to ${e.target.value}.`);
                              }}
                              className={`text-xs font-bold border rounded-lg px-2 py-1.5 cursor-pointer outline-none ${lead.status === 'NEW' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  lead.status === 'CONTACTED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-neutral-100 text-neutral-500 border-neutral-200'
                                }`}
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="CONVERTED">CONVERTED</option>
                            </select>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={async () => {
                                if (confirm('Purge this lead record permanently?')) {
                                  await deleteSkinLead(lead._id!);
                                  triggerToast('Lead record purged.', 'error');
                                }
                              }}
                              className="p-2 text-neutral-300 hover:text-rose-600 rounded-xl transition-colors animate-pulse"
                              title="Purge Lead"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {skinLeads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-neutral-400 font-bold text-sm bg-neutral-50/30">
                            No skin diagnostic scan leads generated yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'instagram' && (
              <motion.div
                key="instagram"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-serif text-3xl font-bold text-neutral-900">Instagram Feed Hub</h3>
                  <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Manage Follow on Instagram posts &amp; reels</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Left Column: Form */}
                  <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm space-y-6">
                    <h4 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">Add Post / Reel</h4>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!instagramUrlInput) {
                        return triggerToast('Instagram post/reel URL is required', 'error');
                      }

                      try {
                        const formData = new FormData();
                        formData.append('instagramUrl', instagramUrlInput);
                        formData.append('mediaType', instagramMediaTypeInput);
                        formData.append('caption', instagramCaptionInput);
                        formData.append('order', instagramOrderInput.toString());
                        formData.append('isPublished', instagramIsPublishedInput.toString());
                        if (instagramFile) {
                          formData.append('mediaFile', instagramFile);
                        }

                        const res = await fetch(`${API_BASE}/instagram-posts/admin`, {
                          method: 'POST',
                          body: formData
                        });

                        const data = await res.json();
                        if (res.ok) {
                          triggerToast('Instagram post added successfully!');
                          setInstagramUrlInput('');
                          setInstagramCaptionInput('');
                          setInstagramOrderInput(0);
                          setInstagramIsPublishedInput(true);
                          setInstagramFile(null);
                          const fileInput = document.querySelector('input[name="instagramThumbFile"]') as HTMLInputElement | null;
                          if (fileInput) fileInput.value = '';
                          fetchInstagramPosts();
                        } else {
                          triggerToast(data.error || 'Failed to add post', 'error');
                        }
                      } catch (err: any) {
                        triggerToast(err.message || 'Error occurred', 'error');
                      }
                    }} className="space-y-4">

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Instagram Link</label>
                        <input
                          type="url"
                          required
                          value={instagramUrlInput}
                          onChange={(e) => setInstagramUrlInput(e.target.value)}
                          className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5"
                          placeholder="e.g. https://www.instagram.com/reel/C7u4_Bypx7e/"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Media Type</label>
                        <select
                          value={instagramMediaTypeInput}
                          onChange={(e) => setInstagramMediaTypeInput(e.target.value as any)}
                          className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5 cursor-pointer"
                        >
                          <option value="image">Image Post</option>
                          <option value="reel">Reel / Video</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Custom Thumbnail Image (Optional)</label>
                        <input
                          type="file"
                          name="instagramThumbFile"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setInstagramFile(e.target.files[0]);
                            }
                          }}
                          className="w-full bg-neutral-50 rounded-xl py-2 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Caption / Description</label>
                        <textarea
                          value={instagramCaptionInput}
                          onChange={(e) => setInstagramCaptionInput(e.target.value)}
                          rows={3}
                          className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5 resize-none"
                          placeholder="Short description overlay..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order / Position</label>
                        <input
                          type="number"
                          value={instagramOrderInput}
                          onChange={(e) => setInstagramOrderInput(parseInt(e.target.value) || 0)}
                          className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-950/5"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={instagramIsPublishedInput}
                          onChange={(e) => setInstagramIsPublishedInput(e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-emerald-950 focus:ring-emerald-950"
                        />
                        <label htmlFor="isPublished" className="text-xs font-bold text-neutral-500 cursor-pointer uppercase tracking-wider">Publish Immediately</label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-900 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-emerald-950 transition-colors shadow-lg shadow-emerald-900/10 cursor-pointer"
                      >
                        Add Feed Post
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List */}
                  <div className="lg:col-span-2 bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50/50 border-b border-neutral-100">
                          <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Feed Post</th>
                          <th className="px-6 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Type</th>
                          <th className="px-6 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Sort Order</th>
                          <th className="px-6 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Status</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instagramPosts.map((post) => (
                          <tr key={post._id} className="border-b border-neutral-100/70 hover:bg-neutral-50/20 transition-colors">
                            <td className="px-8 py-5 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 flex-shrink-0">
                                <img src={getMediaUrl(post.thumbnailUrl)} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <a
                                  href={post.instagramUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-emerald-950 hover:underline flex items-center gap-1"
                                >
                                  Open Link <ExternalLink className="w-3 h-3" />
                                </a>
                                <p className="text-[10px] text-neutral-400 truncate max-w-xs mt-1">{post.caption || 'No caption'}</p>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${post.mediaType === 'reel' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                {post.mediaType}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-center">
                              <input
                                type="number"
                                defaultValue={post.order}
                                onBlur={async (e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val !== post.order) {
                                    try {
                                      await fetch(`${API_BASE}/instagram-posts/admin/${post._id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ order: val })
                                      });
                                      triggerToast('Order position saved.');
                                      fetchInstagramPosts();
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                                className="w-16 bg-neutral-50 text-center border-none rounded-lg py-1 px-2 text-xs font-bold focus:ring-2 focus:ring-emerald-950/5"
                              />
                            </td>

                            <td className="px-6 py-5 text-center">
                              <button
                                onClick={async () => {
                                  try {
                                    await fetch(`${API_BASE}/instagram-posts/admin/${post._id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ isPublished: !post.isPublished })
                                    });
                                    triggerToast(`Post status set to ${!post.isPublished ? 'Published' : 'Draft'}`);
                                    fetchInstagramPosts();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer ${post.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                                  }`}
                              >
                                {post.isPublished ? 'Published' : 'Draft'}
                              </button>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this Instagram post link permanently?')) {
                                    try {
                                      const res = await fetch(`${API_BASE}/instagram-posts/admin/${post._id}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        triggerToast('Post link removed successfully.', 'error');
                                        fetchInstagramPosts();
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                                className="p-2 text-neutral-300 hover:text-rose-600 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {instagramPosts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-8 py-20 text-center text-neutral-400 font-bold text-sm bg-neutral-50/30">
                              No Instagram feed posts configured yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 ${showToast.type === 'success' ? 'bg-emerald-900 text-white' : 'bg-rose-900 text-white'
              }`}
          >
            {showToast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-300" />}
            <span className="text-xs font-bold uppercase tracking-widest">{showToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Details Modal */}
      <AnimatePresence>
        {selectedApptDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedApptDetail(null)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Case Details</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Patient Profile & Clinical Status</p>
                  </div>
                  <button onClick={() => setSelectedApptDetail(null)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 text-sm">
                  {/* Profile Summary Card */}
                  <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-extrabold text-lg flex-none uppercase">
                      {selectedApptDetail.patientName?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-base text-neutral-900 truncate">{selectedApptDetail.patientName || 'Incognito Guest'}</p>
                      <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">{selectedApptDetail.patientId || 'NO-ID'}</p>
                    </div>
                  </div>

                  {/* Profile Information details */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-h-[30vh] overflow-y-auto pr-1">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Mobile Number</p>
                      <p className="font-bold text-neutral-800 mt-1">{selectedApptDetail.mobile || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email Address</p>
                      <p className="font-bold text-neutral-800 mt-1 break-all">{selectedApptDetail.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Age</p>
                      <p className="font-bold text-neutral-800 mt-1">{selectedApptDetail.age || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Treatment Path</p>
                      <p className="font-bold text-emerald-800 mt-1">{selectedApptDetail.treatment || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Consultation Type</p>
                      <p className="font-bold text-neutral-800 mt-1 uppercase">{selectedApptDetail.consultationType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Session Slot</p>
                      <p className="font-bold text-neutral-800 mt-1">{selectedApptDetail.date} • {selectedApptDetail.startTime || selectedApptDetail.time}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Payment Method</p>
                      <p className="font-bold text-neutral-800 mt-1 uppercase">{selectedApptDetail.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Payment Status</p>
                      <p className="font-bold text-neutral-800 mt-1 capitalize">{selectedApptDetail.paymentStatus || 'Pending'}</p>
                    </div>
                  </div>

                  {/* Concern / Notes */}
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Patient Concern / Comments</p>
                    <div className="bg-neutral-50 p-4 rounded-2xl mt-1 max-h-24 overflow-y-auto">
                      <p className="text-xs text-neutral-600 font-medium leading-relaxed italic">
                        {selectedApptDetail.concern || 'No additional comments provided by patient.'}
                      </p>
                    </div>
                  </div>

                  {/* Meeting link */}
                  {selectedApptDetail.consultationType === 'ONLINE' && selectedApptDetail.meetLink && (
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Video consultation link</p>
                      <a 
                        href={selectedApptDetail.meetLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-blue-600 hover:underline block mt-1 break-all"
                      >
                        {selectedApptDetail.meetLink}
                      </a>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedApptDetail(null)}
                  className="w-full mt-8 bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-emerald-900/10"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
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

                  // Name validation
                  if (newAppt.name.trim().length < 2 || !/^[A-Za-z\s]+$/.test(newAppt.name.trim())) {
                    return triggerToast('Name must contain only letters and be at least 2 characters', 'error');
                  }

                  // Age validation
                  const ageVal = parseInt(newAppt.age, 10);
                  if (isNaN(ageVal) || ageVal < 1 || ageVal > 120) {
                    return triggerToast('Age must be between 1 and 120', 'error');
                  }

                  // Mobile validation
                  if (!/^[6-9]\d{9}$/.test(newAppt.mobile.trim())) {
                    return triggerToast('Mobile number must be a valid 10-digit number starting with 6-9', 'error');
                  }

                  // Email validation
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAppt.email.trim())) {
                    return triggerToast('Email address must be a valid email format', 'error');
                  }

                  addAppointment({
                    patientName: newAppt.name,
                    patientAvatar: '',
                    treatment: newAppt.treatment,
                    time: newAppt.time,
                    date: newAppt.date,
                    mobile: newAppt.mobile.trim(),
                    email: newAppt.email.trim().toLowerCase(),
                    age: ageVal
                  });
                  setNewAppt({
                    name: '',
                    treatment: 'Acne Therapy',
                    time: '10:00 AM',
                    date: new Date().toISOString().split('T')[0],
                    mobile: '',
                    email: '',
                    age: '25'
                  });
                  setShowNewApptModal(false);
                  triggerToast('Patient registered and slot assigned.');
                }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Legal Full Name</label>
                      <input
                        required type="text" value={newAppt.name}
                        onChange={(e) => setNewAppt({ ...newAppt, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Case Age</label>
                      <input
                        required type="number" value={newAppt.age}
                        onChange={(e) => setNewAppt({ ...newAppt, age: e.target.value })}
                        placeholder="25"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Mobile Contact</label>
                      <input
                        required type="text" value={newAppt.mobile}
                        onChange={(e) => setNewAppt({ ...newAppt, mobile: e.target.value })}
                        placeholder="10-digit number"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
                      <input
                        required type="email" value={newAppt.email}
                        onChange={(e) => setNewAppt({ ...newAppt, email: e.target.value })}
                        placeholder="patient@domain.com"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Assigned Date</label>
                      <input
                        required type="date" value={newAppt.date}
                        onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Assigned Time Slot</label>
                      <input
                        required type="text" value={newAppt.time}
                        onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                        placeholder="10:00 AM"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Involved Service</label>
                    <select
                      value={newAppt.treatment}
                      onChange={(e) => setNewAppt({ ...newAppt, treatment: e.target.value })}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 cursor-pointer"
                    >
                      <option>Laser Hair Reduction</option>
                      <option>Hair Transplant</option>
                      <option>Tattoo Removal Service</option>
                      <option>HydraFacial</option>
                      <option>PRP Treatment</option>
                      <option>Chemical Peel Service</option>
                      <option>Double Chin Reduction</option>
                      <option>Laser Treatment by CO2</option>
                      <option>Lip Blushing Service</option>
                      <option>Beard Transplant</option>
                      <option>Scar Transplant</option>
                      <option>Acne Treatment (Laser)</option>
                      <option>Mole/Wart Removal</option>
                      <option>Hollywood Peel</option>
                      <option>Vampire Facial</option>
                      <option>HIFU Treatment</option>
                      <option>Melasma Treatment</option>
                      <option>Laser Lip Surgery</option>
                      <option>Intense Pulsed Light (IPL) treatment</option>
                      <option>Hymenoplasty Treatment</option>
                      <option>Dermapen 4 Treatment</option>
                      <option>IPL Hair treatment</option>
                      <option>Bikini Line Hair Removal Treatment</option>
                      <option>Dandruff Treatment Treatment</option>
                      <option>Dimple Creation</option>
                      <option>Skin Blemishes</option>
                      <option>Alopecia areata diagnosis and treatment</option>
                      <option>Trichologist for Hair Treatment</option>
                      <option>G-shot Treatment</option>
                      <option>Lymphatic Drainage Massage</option>
                      <option>post pregnancy Aesthetic treatments</option>
                      <option>Microblading treatments</option>
                      <option>Botox & Fillers</option>
                    </select>
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
                  const isValidUrl = (url: string) => /^https?:\/\/.+/.test(url);
                  if (!isValidUrl(newGallery.url)) {
                    return triggerToast('Image endpoint must be a valid URL starting with http:// or https://', 'error');
                  }
                  addGalleryItem({
                    title: newGallery.title,
                    url: newGallery.url,
                    ...(newGallery.order.trim() !== '' ? { order: Number(newGallery.order) } : {})
                  });
                  setNewGallery({ title: '', url: '', order: '' });
                  setShowNewGalleryModal(false);
                  triggerToast('Asset integrated into showcase.');
                }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Asset Title</label>
                    <input
                      required type="text" value={newGallery.title}
                      onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                      placeholder="e.g. VIP Treatment Wing"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Image Endpoint (URL)</label>
                    <input
                      required type="url" value={newGallery.url}
                      onChange={(e) => setNewGallery({ ...newGallery, url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Display Order</label>
                    <input
                      type="number" value={newGallery.order}
                      onChange={(e) => setNewGallery({ ...newGallery, order: e.target.value })}
                      placeholder="Lower numbers show first — leave blank to add at the end"
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

      {/* Edit Gallery Item Modal */}
      <AnimatePresence>
        {showEditGalleryModal && editingGalleryItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowEditGalleryModal(false); setEditingGalleryItem(null); }}
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
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Edit Portfolio Item</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Clinic Showcase Update</p>
                  </div>
                  <button onClick={() => { setShowEditGalleryModal(false); setEditingGalleryItem(null); }} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  if (editingGalleryItem && editingGalleryItem._id) {
                    const isValidUrl = (url: string) => /^https?:\/\/.+/.test(url);
                    if (!isValidUrl(editingGalleryItem.url)) {
                      return triggerToast('Image endpoint must be a valid URL starting with http:// or https://', 'error');
                    }
                    updateGalleryItem(editingGalleryItem._id, {
                      title: editingGalleryItem.title,
                      url: editingGalleryItem.url,
                      order: editingGalleryItem.order ?? 0
                    });
                    setShowEditGalleryModal(false);
                    setEditingGalleryItem(null);
                    triggerToast('Showcase item updated.');
                  }
                }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Asset Title</label>
                    <input
                      required type="text" value={editingGalleryItem.title}
                      onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                      placeholder="e.g. VIP Treatment Wing"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Image Endpoint (URL)</label>
                    <input
                      required type="url" value={editingGalleryItem.url}
                      onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Display Order</label>
                    <input
                      type="number" value={editingGalleryItem.order ?? 0}
                      onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, order: Number(e.target.value) })}
                      placeholder="Lower numbers show first"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4"
                  >
                    Save Changes
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
                  const isValidUrl = (url: string) => /^https?:\/\/.+/.test(url);
                  if (!isValidUrl(newReel.coverImage) || !isValidUrl(newReel.videoUrl)) {
                    return triggerToast('Cover and Video links must be valid URLs starting with http:// or https://', 'error');
                  }
                  addReel(newReel);
                  setNewReel({ title: '', coverImage: '', videoUrl: '', type: 'smart_display' });
                  setShowNewReelModal(false);
                  triggerToast('Content added to Insight channel.');
                }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Reel Title</label>
                    <input
                      required type="text" value={newReel.title}
                      onChange={(e) => setNewReel({ ...newReel, title: e.target.value })}
                      placeholder="e.g. PRP Therapy Benefits"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Cover Asset (URL)</label>
                    <input
                      required type="url" value={newReel.coverImage}
                      onChange={(e) => setNewReel({ ...newReel, coverImage: e.target.value })}
                      placeholder="YouTube Thumbnail or Source Image"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Video Link (YouTube/Instagram)</label>
                    <input
                      required type="url" value={newReel.videoUrl}
                      onChange={(e) => setNewReel({ ...newReel, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/shorts/... or Insta reel link"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Interaction Type</label>
                    <select
                      value={newReel.type}
                      onChange={(e) => setNewReel({ ...newReel, type: e.target.value as any })}
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

      {/* Edit Insight Reel Modal */}
      <AnimatePresence>
        {showEditReelModal && editingReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowEditReelModal(false); setEditingReel(null); }}
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
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Edit Clinical Insight</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Dermatological Video Channel</p>
                  </div>
                  <button onClick={() => { setShowEditReelModal(false); setEditingReel(null); }} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  if (editingReel && editingReel._id) {
                    const isValidUrl = (url: string) => /^https?:\/\/.+/.test(url);
                    if (!isValidUrl(editingReel.coverImage) || !isValidUrl(editingReel.videoUrl)) {
                      return triggerToast('Cover and Video links must be valid URLs starting with http:// or https://', 'error');
                    }
                    updateReel(editingReel._id, {
                      title: editingReel.title,
                      coverImage: editingReel.coverImage,
                      videoUrl: editingReel.videoUrl,
                      type: editingReel.type
                    });
                    setShowEditReelModal(false);
                    setEditingReel(null);
                    triggerToast('Insight updated successfully.');
                  }
                }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Reel Title</label>
                    <input
                      required type="text" value={editingReel.title}
                      onChange={(e) => setEditingReel({ ...editingReel, title: e.target.value })}
                      placeholder="e.g. PRP Therapy Benefits"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Cover Asset (URL)</label>
                    <input
                      required type="url" value={editingReel.coverImage}
                      onChange={(e) => setEditingReel({ ...editingReel, coverImage: e.target.value })}
                      placeholder="YouTube Thumbnail or Source Image"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Video Link (YouTube/Instagram)</label>
                    <input
                      required type="url" value={editingReel.videoUrl}
                      onChange={(e) => setEditingReel({ ...editingReel, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/shorts/... or Insta reel link"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Interaction Type</label>
                    <select
                      value={editingReel.type}
                      onChange={(e) => setEditingReel({ ...editingReel, type: e.target.value as any })}
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
                    Save Changes
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* New Blog Modal */}
      <AnimatePresence>
        {showNewBlogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewBlogModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative z-10 my-8"
            >
              <div className="p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Add Blog Post</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Publish a Skincare/Hair Restoration Article</p>
                  </div>
                  <button onClick={() => setShowNewBlogModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!blogImageFile && !newBlog.image) {
                    return triggerToast('Please upload a cover image or provide a valid cover image URL', 'error');
                  }

                  const formData = new FormData();
                  formData.append('title', newBlog.title);
                  formData.append('slug', newBlog.slug);
                  formData.append('summary', newBlog.summary);
                  formData.append('content', newBlog.content);
                  formData.append('category', newBlog.category);
                  formData.append('author', newBlog.author);
                  formData.append('dateString', newBlog.dateString);

                  if (blogImageFile) {
                    formData.append('blogImage', blogImageFile);
                  } else {
                    formData.append('image', newBlog.image);
                  }

                  await addBlogPost(formData as any);
                  setShowNewBlogModal(false);
                  setBlogImageFile(null);
                  triggerToast('Blog post published successfully!');
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Article Title</label>
                    <input
                      required type="text" value={newBlog.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewBlog({ ...newBlog, title: val, slug: generateSlug(val) });
                      }}
                      placeholder="e.g. Exosomes for Hair Loss: Is This the Future?"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">URL Slug</label>
                      <input
                        required type="text" value={newBlog.slug}
                        onChange={(e) => setNewBlog({ ...newBlog, slug: generateSlug(e.target.value) })}
                        placeholder="exosomes-for-hair-loss"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Category</label>
                      <input
                        required type="text" value={newBlog.category}
                        onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                        placeholder="e.g. Skincare Treatment"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Date Badge (e.g. 17 Jun)</label>
                      <input
                        required type="text" value={newBlog.dateString}
                        onChange={(e) => setNewBlog({ ...newBlog, dateString: e.target.value })}
                        placeholder="17 Jun"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Author Name</label>
                      <input
                        required type="text" value={newBlog.author}
                        onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                        placeholder="Dr. Megha Pundir Singh"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Cover Image File (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setBlogImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full bg-neutral-50 rounded-2xl py-2 px-3 text-xs font-medium ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Cover Image URL (Fallback)</label>
                      <input
                        type="url" value={newBlog.image}
                        onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Short Summary (Preview text)</label>
                    <textarea
                      required value={newBlog.summary} rows={2}
                      onChange={(e) => setNewBlog({ ...newBlog, summary: e.target.value })}
                      placeholder="Enter a brief summary of the article to show in grid..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-medium ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Full Article Content (paragraphs separated by double lines)</label>
                    <textarea
                      required value={newBlog.content} rows={6}
                      onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                      placeholder="Write your blog content here. Use ### For headings, and double returns for paragraphs..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-medium ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 cursor-pointer"
                  >
                    Publish Post
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Blog Modal */}
      <AnimatePresence>
        {showEditBlogModal && editingBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowEditBlogModal(false); setEditingBlog(null); }}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative z-10 my-8"
            >
              <div className="p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Edit Blog Post</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Modify Published Article Details</p>
                  </div>
                  <button onClick={() => { setShowEditBlogModal(false); setEditingBlog(null); }} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  if (editingBlog && editingBlog._id) {
                    if (!editBlogImageFile && !editingBlog.image) {
                      return triggerToast('Please upload a cover image or provide a valid cover image URL', 'error');
                    }

                    const formData = new FormData();
                    formData.append('title', editingBlog.title);
                    formData.append('slug', editingBlog.slug);
                    formData.append('summary', editingBlog.summary);
                    formData.append('content', editingBlog.content);
                    formData.append('category', editingBlog.category);
                    formData.append('author', editingBlog.author);
                    formData.append('dateString', editingBlog.dateString);

                    if (editBlogImageFile) {
                      formData.append('blogImage', editBlogImageFile);
                    } else {
                      formData.append('image', editingBlog.image);
                    }

                    await updateBlogPost(editingBlog._id, formData as any);
                    setShowEditBlogModal(false);
                    setEditingBlog(null);
                    setEditBlogImageFile(null);
                    triggerToast('Blog post updated successfully.');
                  }
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Article Title</label>
                    <input
                      required type="text" value={editingBlog.title}
                      onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value, slug: generateSlug(e.target.value) })}
                      placeholder="e.g. Exosomes for Hair Loss: Is This the Future?"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">URL Slug</label>
                      <input
                        required type="text" value={editingBlog.slug}
                        onChange={(e) => setEditingBlog({ ...editingBlog, slug: generateSlug(e.target.value) })}
                        placeholder="exosomes-for-hair-loss"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Category</label>
                      <input
                        required type="text" value={editingBlog.category}
                        onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                        placeholder="e.g. Skincare Treatment"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Date Badge (e.g. 17 Jun)</label>
                      <input
                        required type="text" value={editingBlog.dateString}
                        onChange={(e) => setEditingBlog({ ...editingBlog, dateString: e.target.value })}
                        placeholder="17 Jun"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Author Name</label>
                      <input
                        required type="text" value={editingBlog.author}
                        onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                        placeholder="Dr. Megha Pundir Singh"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Cover Image File (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setEditBlogImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full bg-neutral-50 rounded-2xl py-2 px-3 text-xs font-medium ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Cover Image URL</label>
                      <input
                        type="url" value={editingBlog.image}
                        onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Short Summary (Preview text)</label>
                    <textarea
                      required value={editingBlog.summary} rows={2}
                      onChange={(e) => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                      placeholder="Enter a brief summary of the article to show in grid..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-medium ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Full Article Content (paragraphs separated by double lines)</label>
                    <textarea
                      required value={editingBlog.content} rows={6}
                      onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                      placeholder="Write your blog content here. Use ### For headings, and double returns for paragraphs..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-medium ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 cursor-pointer"
                  >
                    Save Post Changes
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Video Testimonial Modal */}
      <AnimatePresence>
        {showNewVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewVideoModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative z-10 my-8"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Add Video Review</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Publish a Video Testimonial</p>
                  </div>
                  <button onClick={() => setShowNewVideoModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newVideo.title || !newVideo.youtubeUrl) {
                    return triggerToast('Title and YouTube URL are required', 'error');
                  }
                  await addVideoTestimonial(newVideo);
                  setShowNewVideoModal(false);
                  triggerToast('Video review published successfully!');
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Video Title</label>
                    <input
                      required type="text" value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      placeholder="e.g. Hair Transplant Testimonial"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">YouTube URL</label>
                    <input
                      required type="url" value={newVideo.youtubeUrl}
                      onChange={(e) => setNewVideo({ ...newVideo, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Category / Tag</label>
                      <input
                        required type="text" value={newVideo.category}
                        onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                        placeholder="e.g. Hair Transplant, Skin Allergy"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Display Order</label>
                      <input
                        required type="number" value={newVideo.order}
                        onChange={(e) => setNewVideo({ ...newVideo, order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 cursor-pointer"
                  >
                    Add Video Review
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Video Testimonial Modal */}
      <AnimatePresence>
        {showEditVideoModal && editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditVideoModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative z-10 my-8"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Edit Video Review</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Modify Testimonial details</p>
                  </div>
                  <button onClick={() => setShowEditVideoModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  await updateVideoTestimonial(editingVideo._id, editingVideo);
                  setShowEditVideoModal(false);
                  triggerToast('Video review updated successfully!');
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Video Title</label>
                    <input
                      required type="text" value={editingVideo.title}
                      onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">YouTube URL</label>
                    <input
                      required type="url" value={editingVideo.youtubeUrl}
                      onChange={(e) => setEditingVideo({ ...editingVideo, youtubeUrl: e.target.value })}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Category / Tag</label>
                      <input
                        required type="text" value={editingVideo.category}
                        onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Display Order</label>
                      <input
                        required type="number" value={editingVideo.order || 0}
                        onChange={(e) => setEditingVideo({ ...editingVideo, order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 cursor-pointer"
                  >
                    Save Video Changes
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Before/After Photo Modal */}
      <AnimatePresence>
        {showNewPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewPhotoModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative z-10 my-8"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Add Before/After Photo</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Publish transformation result</p>
                  </div>
                  <button onClick={() => setShowNewPhotoModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newPhoto.title || !newPhoto.beforeUrl || !newPhoto.afterUrl) {
                    return triggerToast('Title, Before URL, and After URL are required', 'error');
                  }
                  await addPhotoTestimonial(newPhoto);
                  setShowNewPhotoModal(false);
                  triggerToast('Before/After record published successfully!');
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Case Title / Patient Label</label>
                    <input
                      required type="text" value={newPhoto.title}
                      onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                      placeholder="e.g. Severe Acne Scar Transformation"
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Treatment Category</label>
                      <input
                        required type="text" value={newPhoto.treatment}
                        onChange={(e) => setNewPhoto({ ...newPhoto, treatment: e.target.value })}
                        placeholder="e.g. Skin Allergy, Hair Restoration"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Display Order</label>
                      <input
                        required type="number" value={newPhoto.order}
                        onChange={(e) => setNewPhoto({ ...newPhoto, order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Before Photo URL</label>
                    <input
                      required type="url" value={newPhoto.beforeUrl}
                      onChange={(e) => setNewPhoto({ ...newPhoto, beforeUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">After Photo URL</label>
                    <input
                      required type="url" value={newPhoto.afterUrl}
                      onChange={(e) => setNewPhoto({ ...newPhoto, afterUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Description (Optional)</label>
                    <textarea
                      value={newPhoto.description} rows={2}
                      onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                      placeholder="Add brief details about the clinical procedure..."
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-medium ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 cursor-pointer"
                  >
                    Add Before/After Photo
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Before/After Photo Modal */}
      <AnimatePresence>
        {showEditPhotoModal && editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditPhotoModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative z-10 my-8"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Edit Before/After Photo</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Modify transformation details</p>
                  </div>
                  <button onClick={() => setShowEditPhotoModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  await updatePhotoTestimonial(editingPhoto._id, editingPhoto);
                  setShowEditPhotoModal(false);
                  triggerToast('Before/After record updated successfully!');
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Case Title / Patient Label</label>
                    <input
                      required type="text" value={editingPhoto.title}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Treatment Category</label>
                      <input
                        required type="text" value={editingPhoto.treatment}
                        onChange={(e) => setEditingPhoto({ ...editingPhoto, treatment: e.target.value })}
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Display Order</label>
                      <input
                        required type="number" value={editingPhoto.order || 0}
                        onChange={(e) => setEditingPhoto({ ...editingPhoto, order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Before Photo URL</label>
                    <input
                      required type="url" value={editingPhoto.beforeUrl}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, beforeUrl: e.target.value })}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">After Photo URL</label>
                    <input
                      required type="url" value={editingPhoto.afterUrl}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, afterUrl: e.target.value })}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-bold ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Description (Optional)</label>
                    <textarea
                      value={editingPhoto.description || ''} rows={2}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3 px-4 text-xs font-medium ring-1 ring-neutral-200 outline-none focus:ring-emerald-900/10 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 cursor-pointer"
                  >
                    Save Photo Changes
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
