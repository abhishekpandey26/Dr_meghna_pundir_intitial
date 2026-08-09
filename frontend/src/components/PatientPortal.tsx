import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { SEO } from './SEO';
import { 
  Mail, 
  Key, 
  ArrowLeft, 
  LogOut, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Edit2, 
  Loader2, 
  Check, 
  Sparkles,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export const PatientPortal: React.FC = () => {
  const { 
    patientToken, 
    currentPatient, 
    patientAppointments, 
    loginPatientWithGoogle, 
    logoutPatient,
    updatePatientProfile,
    loadPatientProfile
  } = useApp();
  const navigate = useNavigate();

  // Load patient profile and history on mount or when token is active
  useEffect(() => {
    if (patientToken && loadPatientProfile) {
      loadPatientProfile();
    }
  }, [patientToken, loadPatientProfile]);

  // Login Form States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Profile Edit States
  const [editMode, setEditMode] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileMobile, setProfileMobile] = useState('');
  const [profileAge, setProfileAge] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Active Tab for Appointments
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Load profile inputs when patient details load
  useEffect(() => {
    if (currentPatient) {
      setProfileName(currentPatient.name || '');
      setProfileMobile(currentPatient.mobile || '');
      setProfileAge(currentPatient.age ? String(currentPatient.age) : '');
    }
  }, [currentPatient]);

  // Validation patterns
  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validateMobile = (val: string) => {
    return /^[6-9]\d{9}$/.test(val);
  };



  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (profileName.trim() && (profileName.trim().length < 2 || !/^[A-Za-z\s]+$/.test(profileName))) {
      setProfileError('Name must contain only letters and be at least 2 characters long');
      return;
    }

    if (profileMobile.trim() && !validateMobile(profileMobile.trim())) {
      setProfileError('Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9');
      return;
    }

    const ageNum = parseInt(profileAge, 10);
    if (profileAge && (isNaN(ageNum) || ageNum < 1 || ageNum > 120)) {
      setProfileError('Enter a valid age between 1 and 120');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updatePatientProfile(profileName, profileMobile, profileAge ? parseInt(profileAge, 10) : undefined);
      if (res.success) {
        setProfileSuccess('Profile details updated successfully');
        setEditMode(false);
      } else {
        setProfileError(res.message || 'Failed to update profile details');
      }
    } catch (err) {
      setProfileError('An error occurred while saving.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Helper to parse dates like "Jul 10", "Jul 02" safely without native parser misinterpreting the day as a year
  const parseApptDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    
    // Format "MMM DD" (e.g. "Jul 10", "Jul 02")
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length === 2) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const mIdx = monthNames.indexOf(parts[0].toLowerCase().slice(0, 3));
      const day = parseInt(parts[1], 10);
      if (mIdx !== -1 && !isNaN(day)) {
        // Assume current year
        const currentYear = new Date().getFullYear();
        return new Date(currentYear, mIdx, day);
      }
    }
    
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  // Sort and split appointments into upcoming and past
  const now = new Date();
  
  const upcomingAppointments = patientAppointments.filter(appt => {
    try {
      const apptDate = parseApptDate(appt.date);
      // If date is today or in future
      apptDate.setHours(23, 59, 59, 999);
      return apptDate >= now && !['CANCELLED', 'REJECTED'].includes(appt.status.toUpperCase());
    } catch (e) {
      return true; // fallback
    }
  });

  const pastAppointments = patientAppointments.filter(appt => {
    try {
      const apptDate = parseApptDate(appt.date);
      apptDate.setHours(23, 59, 59, 999);
      return apptDate < now || ['CANCELLED', 'REJECTED', 'COMPLETED'].includes(appt.status.toUpperCase());
    } catch (e) {
      return false;
    }
  });

  const getStatusStyle = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'CONFIRMED':
      case 'APPROVED':
        return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600';
      case 'PENDING':
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-600';
      case 'COMPLETED':
        return 'bg-blue-500/10 border border-blue-500/20 text-blue-600';
      case 'PAYMENT_PENDING':
        return 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600';
      case 'CANCELLED':
      case 'REJECTED':
      case 'PAYMENT_FAILED':
        return 'bg-rose-500/10 border border-rose-500/20 text-rose-600';
      default:
        return 'bg-neutral-500/10 border border-neutral-500/20 text-neutral-600';
    }
  };

  // Handle joining online call
  const handleJoinCall = (apptId: string) => {
    navigate(`/video-room?id=${apptId}`);
  };

  return (
    <div className="min-h-screen pb-24 font-sans" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
      <SEO title="Patient Portal" />
      {/* Top Bar Navigation */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 font-bold uppercase tracking-[0.2em] text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: 'var(--muted)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold" style={{ color: 'var(--ink)' }}>Derm Elixir</span>
          <span
            className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: 'rgba(184,103,79,0.1)', color: 'var(--terracotta-dark)', border: '1px solid rgba(184,103,79,0.2)' }}
          >Portal</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-10 md:mt-14">
        <AnimatePresence mode="wait">
          {!patientToken ? (
            /* ================= LOGIN CARD ================= */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg text-white"
                  style={{ background: 'var(--terracotta)' }}
                >
                  <Sparkles className="w-7 h-7" />
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-semibold" style={{ color: 'var(--ink)' }}>Patient Portal</h1>
                <p className="text-xs mt-3 uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>Secure access via Google</p>
              </div>

              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm space-y-6 text-center" style={{ border: '1px solid var(--border)' }}>
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-left">
                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wider leading-relaxed">{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider leading-relaxed">{successMsg}</span>
                  </div>
                )}

                <p className="text-xs leading-relaxed max-w-xs mx-auto mb-4" style={{ color: 'var(--muted)' }}>
                  Please log in with your Google account to view your scheduled visits, access video rooms, and manage your patient profile.
                </p>

                <button
                  onClick={async () => {
                    setError('');
                    setLoading(true);
                    try {
                      const result = await signInWithPopup(auth, googleProvider);
                      const user = result.user;
                      if (user && user.email) {
                        const res = await loginPatientWithGoogle(user.email, user.displayName || '');
                        if (!res.success) {
                          setError(res.message || 'Authentication failed');
                        }
                      }
                    } catch (err: any) {
                      setError('Google sign-in error: ' + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 text-white"
                  style={{ background: 'var(--terracotta)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--terracotta-dark)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--terracotta)')}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In with Google</>}
                </button>
              </div>
            </motion.div>
          ) : (
            /* ================= PORTAL DASHBOARD ================= */
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Profile Welcome Banner */}
              <div
                className="text-white p-8 md:p-12 rounded-2xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                style={{ background: 'linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-dark) 100%)' }}
              >
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2 w-fit px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <Sparkles className="w-3 h-3" /> Derm Elixir Patient Portal
                  </div>
                  <h2 className="font-serif text-3xl md:text-5xl font-semibold leading-tight text-white">
                    Welcome, {currentPatient?.name || 'Valued Patient'}
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>{currentPatient?.email}</p>
                </div>
                <button
                  onClick={logoutPatient}
                  className="py-3.5 px-7 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 cursor-pointer transition-all self-start md:self-center hover:shadow-md active:scale-95 duration-300 relative z-20"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--terracotta-dark)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>

              {/* Grid Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Profile Details Edit */}
                <div className="space-y-6">
                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm" style={{ border: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--ink)' }}>Patient Details</h3>
                      {!editMode && (
                        <button
                          onClick={() => setEditMode(true)}
                          className="text-[9px] font-bold rounded-xl px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                          style={{ color: 'var(--terracotta)', border: '1px solid var(--terracotta)', background: 'transparent' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--blush)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Edit2 className="w-3 h-3" /> Update Profile
                        </button>
                      )}
                    </div>

                    {profileError && (
                      <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-[9px] text-rose-800 font-bold uppercase tracking-wider mb-4">
                        {profileError}
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[9px] text-emerald-800 font-bold uppercase tracking-wider mb-4">
                        {profileSuccess}
                      </div>
                    )}

                    {!editMode ? (
                      /* Display details */
                      <div className="space-y-5">
                        {(!currentPatient?.name || !currentPatient?.mobile) && (
                          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl mb-2 text-[10px] font-semibold text-amber-700 leading-relaxed">
                            💡 Complete your profile details below to help us coordinate your clinical consultations.
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 p-4 rounded-2xl">
                          <div className="w-10 h-10 bg-emerald-950/5 text-emerald-950 rounded-xl flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Legal Name</p>
                            <p className="text-xs font-bold text-emerald-950 mt-0.5">{currentPatient?.name || <span className="text-stone-400 italic">Not updated</span>}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 p-4 rounded-2xl">
                          <div className="w-10 h-10 bg-emerald-950/5 text-emerald-950 rounded-xl flex items-center justify-center">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Mobile Contact</p>
                            <p className="text-xs font-bold text-emerald-950 mt-0.5">{currentPatient?.mobile || <span className="text-stone-400 italic">Not updated</span>}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 p-4 rounded-2xl">
                          <div className="w-10 h-10 bg-emerald-950/5 text-emerald-950 rounded-xl flex items-center justify-center">
                            <span className="w-4 h-4 text-xs font-bold flex items-center justify-center">#</span>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Age</p>
                            <p className="text-xs font-bold text-emerald-950 mt-0.5">{currentPatient?.age || <span className="text-stone-400 italic">Not updated</span>}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 p-4 rounded-2xl">
                          <div className="w-10 h-10 bg-emerald-950/5 text-emerald-950 rounded-xl flex items-center justify-center">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Primary Email</p>
                            <p className="text-xs font-bold text-emerald-950 mt-0.5">{currentPatient?.email}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Edit mode form */
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400 ml-1">Legal Name</label>
                          <input 
                            type="text"
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            placeholder="Enter legal name"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-xs font-semibold text-emerald-950 focus:border-emerald-950 outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400 ml-1">Mobile Contact</label>
                          <input 
                            type="text"
                            value={profileMobile}
                            onChange={e => setProfileMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="10-digit mobile number"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-xs font-semibold text-emerald-950 focus:border-emerald-950 outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400 ml-1">Age</label>
                          <input 
                            type="number"
                            value={profileAge}
                            onChange={e => setProfileAge(e.target.value)}
                            placeholder="Enter age"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-xs font-semibold text-emerald-950 focus:border-emerald-950 outline-none transition-colors"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            type="submit"
                            disabled={savingProfile}
                            className="flex-1 bg-emerald-950 hover:bg-black text-white rounded-xl py-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Save</>}
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setEditMode(false); setProfileError(''); }}
                            className="flex-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-600 rounded-xl py-3 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Appointments timeline */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setActiveTab('upcoming')}
                        className={`text-xs font-bold uppercase tracking-widest pb-2 transition-all relative ${
                          activeTab === 'upcoming' ? 'text-emerald-950 font-extrabold' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        Upcoming Sessions ({upcomingAppointments.length})
                        {activeTab === 'upcoming' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-950" />}
                      </button>
                      <button 
                        onClick={() => setActiveTab('past')}
                        className={`text-xs font-bold uppercase tracking-widest pb-2 transition-all relative ${
                          activeTab === 'past' ? 'text-emerald-950 font-extrabold' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        Treatment History ({pastAppointments.length})
                        {activeTab === 'past' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-950" />}
                      </button>
                    </div>

                    <button 
                      onClick={() => navigate('/booking')}
                      className="bg-emerald-950 hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest py-3 px-5 rounded-2xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/10"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book Session
                    </button>
                  </div>

                  {/* Appointments list */}
                  <div className="space-y-4">
                    {activeTab === 'upcoming' ? (
                      upcomingAppointments.length === 0 ? (
                        <div className="glass-card bg-white/70 p-12 text-center rounded-[32px] border border-white shadow-xl shadow-emerald-950/5 space-y-4">
                          <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
                            <ClipboardList className="w-6 h-6" />
                          </div>
                          <p className="font-serif text-lg font-bold text-emerald-950">No Scheduled Sessions</p>
                          <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">You don't have any upcoming medical or aesthetic consultations booked at the moment.</p>
                          <button 
                            onClick={() => navigate('/booking')}
                            className="bg-emerald-950 hover:bg-black text-white text-[9px] font-bold uppercase tracking-[0.25em] py-4 px-8 rounded-xl transition-all inline-block mt-2 cursor-pointer shadow-lg shadow-emerald-950/10"
                          >
                            Book Consultation Now
                          </button>
                        </div>
                      ) : (
                        upcomingAppointments.map((appt, i) => (
                          <motion.div 
                            key={appt._id || i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card bg-white/80 p-6 md:p-8 rounded-[28px] border border-white shadow-lg shadow-emerald-950/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                          >
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusStyle(appt.status)}`}>
                                  {appt.status}
                                </span>
                                <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                  appt.consultationType === 'ONLINE' 
                                    ? 'bg-blue-50 border-blue-100 text-blue-600' 
                                    : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                }`}>
                                  {appt.consultationType === 'ONLINE' ? 'Online Video' : 'In-Clinic'}
                                </span>
                              </div>

                              <h4 className="font-serif text-xl font-bold text-emerald-950">{appt.treatment}</h4>
                              
                              <div className="flex items-center gap-6 text-stone-500 flex-wrap">
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{appt.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{appt.startTime || appt.time}</span>
                                </div>
                              </div>
                            </div>

                            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 pt-2 md:pt-0">
                              {/* Join Call button */}
                              {appt.consultationType === 'ONLINE' && ['CONFIRMED', 'APPROVED'].includes(appt.status.toUpperCase()) && (
                                <button 
                                  onClick={() => handleJoinCall(appt._id || '')}
                                  className="flex-1 md:flex-none bg-emerald-950 hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/15 cursor-pointer"
                                >
                                  <Video className="w-4 h-4" /> Join Telehealth
                                </button>
                              )}

                              {/* Consultation Address Info */}
                              {appt.consultationType !== 'ONLINE' && (
                                <div className="text-left md:text-right text-[10px] text-stone-400 bg-stone-50 border border-stone-100 p-3.5 rounded-xl flex items-start gap-2 max-w-xs">
                                  <MapPin className="w-4 h-4 text-emerald-800 flex-shrink-0" />
                                  <span>Varanasi Clinic: Gyandeep Medicare Hospital, Lanka</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )
                    ) : (
                      pastAppointments.length === 0 ? (
                        <div className="glass-card bg-white/70 p-12 text-center rounded-[32px] border border-white shadow-xl shadow-emerald-950/5 space-y-3">
                          <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
                            <ClipboardList className="w-6 h-6" />
                          </div>
                          <p className="font-serif text-lg font-bold text-emerald-950">No Past Records</p>
                          <p className="text-stone-500 text-xs">You have no archived/completed appointments on this profile yet.</p>
                        </div>
                      ) : (
                        pastAppointments.map((appt, i) => (
                          <motion.div 
                            key={appt._id || i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card bg-white/50 p-6 md:p-8 rounded-[28px] border border-stone-200/50 shadow-md shadow-emerald-950/2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-75"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusStyle(appt.status)}`}>
                                  {appt.status}
                                </span>
                                <span className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600">
                                  {appt.consultationType === 'ONLINE' ? 'Online Call' : 'In-Clinic'}
                                </span>
                              </div>

                              <h4 className="font-serif text-lg font-bold text-emerald-950">{appt.treatment}</h4>
                              
                              <div className="flex items-center gap-6 text-stone-500 flex-wrap">
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{appt.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{appt.startTime || appt.time}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
