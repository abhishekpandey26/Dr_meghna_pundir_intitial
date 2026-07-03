import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, ClinicConfig, ReelInsight, BeforeAfterItem, SkinLead, Patient, BlogPost, VideoTestimonial, PhotoTestimonial } from '../types';

export type AppView = 'landing' | 'booking' | 'admin' | 'admin-login' | 'skin-analyzer' | 'video-room' | 'patient-portal' | 'blog-detail' | 'testimonials' | 'about' | 'gallery';

export interface FetchAppointmentsParams {
  page?: number;
  limit?: number;
  status?: string;
  payment?: string;
  search?: string;
  sortBy?: string;
  order?: string;
}

interface AppContextProps {
  view: AppView;
  setView: (view: AppView, slug?: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  appointments: Appointment[];
  fetchAppointments: (params?: FetchAppointmentsParams) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  updateAppointmentStatus: (id: string, status: string) => Promise<void>;
  addAppointment: (data: any) => Promise<any>;
  clinicConfig: ClinicConfig;
  updateClinicConfig: (config: ClinicConfig) => Promise<void>;
  blockedDates: string[];
  toggleBlockedDate: (date: string) => void;
  holidays: string[];
  toggleHoliday: (holidayName: string) => void;
  emergencyClosed: boolean;
  setEmergencyClosed: (closed: boolean) => void;
  selectedTreatmentForBooking: string;
  setSelectedTreatmentForBooking: (treatment: string) => void;
  adminSearchQuery: string;
  setAdminSearchQuery: (query: string) => void;
  galleryItems: { _id: string, title: string, url: string }[];
  addGalleryItem: (item: { title: string, url: string }) => Promise<void>;
  removeGalleryItem: (id: string) => Promise<void>;
  updateGalleryItem: (id: string, item: { title: string, url: string }) => Promise<void>;
  reels: ReelInsight[];
  addReel: (reel: { title: string, coverImage: string, videoUrl: string, type: 'photo_camera' | 'smart_display' }) => Promise<void>;
  removeReel: (id: string) => Promise<void>;
  updateReel: (id: string, reel: { title: string, coverImage: string, videoUrl: string, type: 'photo_camera' | 'smart_display' }) => Promise<void>;
  lockSlot: (date: string, startTime: string) => Promise<any>;
  initiatePayment: (data: any) => Promise<any>;
  verifyPayment: (paymentId: string, paymentRequestId: string, appointmentId: string) => Promise<any>;
  beforeAfterItems: BeforeAfterItem[];
  addBeforeAfter: (item: Omit<BeforeAfterItem, '_id'>) => Promise<void>;
  deleteBeforeAfter: (id: string) => Promise<void>;
  skinLeads: SkinLead[];
  fetchSkinLeads: () => Promise<void>;
  submitSkinLead: (lead: Omit<SkinLead, '_id' | 'status'>) => Promise<any>;
  deleteSkinLead: (id: string) => Promise<void>;
  updateSkinLeadStatus: (id: string, status: string) => Promise<void>;
  totalPages: number;
  totalRecords: number;
  patientToken: string | null;
  currentPatient: Patient | null;
  patientAppointments: Appointment[];
  loginPatientWithGoogle: (email: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logoutPatient: () => void;
  loadPatientProfile: () => Promise<void>;
  updatePatientProfile: (name: string, mobile: string, age?: number) => Promise<{ success: boolean; message?: string }>;
  blogs: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, '_id'> | FormData) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  updateBlogPost: (id: string, post: Partial<BlogPost> | FormData) => Promise<void>;
  // Testimonials
  videoTestimonials: VideoTestimonial[];
  addVideoTestimonial: (v: Omit<VideoTestimonial, '_id'>) => Promise<void>;
  deleteVideoTestimonial: (id: string) => Promise<void>;
  updateVideoTestimonial: (id: string, v: Partial<VideoTestimonial>) => Promise<void>;
  photoTestimonials: PhotoTestimonial[];
  addPhotoTestimonial: (p: Omit<PhotoTestimonial, '_id'>) => Promise<void>;
  deletePhotoTestimonial: (id: string) => Promise<void>;
  updatePhotoTestimonial: (id: string, p: Partial<PhotoTestimonial>) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setViewState] = useState<AppView>('landing');
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => {
    return localStorage.getItem('dermelixir_admin_auth') === 'true';
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>({
    startHour: '09:00',
    endHour: '19:30',
    slotDuration: 30,
    blockedDates: [],
    holidays: []
  });
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [reels, setReels] = useState<ReelInsight[]>([]);
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfterItem[]>([]);
  const [skinLeads, setSkinLeads] = useState<SkinLead[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [photoTestimonials, setPhotoTestimonials] = useState<PhotoTestimonial[]>([]);

  const [patientToken, setPatientToken] = useState<string | null>(() => {
    return localStorage.getItem('dermelixir_patient_token');
  });
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  const [emergencyClosed, setEmergencyClosedState] = useState<boolean>(() => {
    return localStorage.getItem('dermelixir_emergency_closed') === 'true';
  });

  const [selectedTreatmentForBooking, setSelectedTreatmentForBooking] = useState<string>('');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastFetchParams, setLastFetchParams] = useState<FetchAppointmentsParams>({
    page: 1,
    limit: 10,
    status: 'all',
  });

  // Initial Hydration
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [configRes, apptsRes, galleryRes, reelsRes, beforeAfterRes, blogsRes] = await Promise.all([
        fetch(`${API_BASE}/config`),
        fetch(`${API_BASE}/appointments`),
        fetch(`${API_BASE}/gallery`),
        fetch(`${API_BASE}/reels`),
        fetch(`${API_BASE}/beforeafter`),
        fetch(`${API_BASE}/blogs`)
      ]);

      const configData = await configRes.json();
      const apptsData = await apptsRes.json();
      const galleryData = await galleryRes.json();
      const reelsData = await reelsRes.json();
      const beforeAfterData = await beforeAfterRes.json();
      const blogsData = await blogsRes.json();

      setClinicConfig(configData);
      setAppointments(apptsData.appointments ?? (Array.isArray(apptsData) ? apptsData : []));
      if (apptsData.totalPages) setTotalPages(apptsData.totalPages);
      if (apptsData.totalRecords) setTotalRecords(apptsData.totalRecords);
      setGalleryItems(galleryData);
      setReels(reelsData);
      setBeforeAfterItems(beforeAfterData);
      setBlogs(blogsData);
    } catch (err) {
      console.error('Failed to sync with Medical Hub:', err);
    }
  };

  const setView = (newView: AppView, slug?: string) => {
    setViewState(newView);
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    if (newView === 'blog-detail' && slug) {
      url.searchParams.set('slug', slug);
    } else if (newView !== 'blog-detail') {
      url.searchParams.delete('slug');
    }
    window.history.pushState({}, '', url);
  };

  const setIsAuthenticated = (val: boolean) => {
    setIsAuthenticatedState(val);
    localStorage.setItem('dermelixir_admin_auth', String(val));
  };

  const updateClinicConfig = async (newConfig: ClinicConfig) => {
    try {
      const res = await fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      setClinicConfig(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async (params: FetchAppointmentsParams = {}) => {
    try {
      const merged = { ...lastFetchParams, ...params };
      setLastFetchParams(merged);

      const query = new URLSearchParams();
      Object.entries(merged).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          query.set(key, String(value));
        }
      });

      const res = await fetch(`${API_BASE}/appointments?${query.toString()}`);
      const data = await res.json();

      if (data.appointments) {
        setAppointments(data.appointments);
        setTotalPages(data.totalPages ?? 1);
        setTotalRecords(data.totalRecords ?? data.appointments.length);
      } else {
        setAppointments(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalRecords(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error('Fetch appointments failed:', err);
    }
  };

  const deleteAppointment = async (id: string) => {
    await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
    await fetchAppointments(lastFetchParams);
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await fetchAppointments(lastFetchParams);
  };

  const addAppointment = async (apptData: any) => {
    const res = await fetch(`${API_BASE}/bookings/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: apptData.date,
        startTime: apptData.time,
        patientData: apptData
      })
    });
    const data = await res.json();
    if (res.ok) {
      await fetchAppointments();
      if (patientToken) {
        await loadPatientProfile();
      }
    }
    return data;
  };

  const lockSlot = async (date: string, startTime: string) => {
    const res = await fetch(`${API_BASE}/bookings/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, startTime, lockedBy: 'patient-session' })
    });
    return await res.json();
  };

  const initiatePayment = async (data: any) => {
    const res = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  };

  const verifyPayment = async (paymentId: string, paymentRequestId: string, appointmentId: string) => {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, payment_request_id: paymentRequestId, appointmentId })
    });
    return await res.json();
  };

  const addGalleryItem = async (item: { title: string, url: string }) => {
    await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const res = await fetch(`${API_BASE}/gallery`);
    setGalleryItems(await res.json());
  };

  const removeGalleryItem = async (id: string) => {
    await fetch(`${API_BASE}/gallery/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API_BASE}/gallery`);
    setGalleryItems(await res.json());
  };

  const updateGalleryItem = async (id: string, item: { title: string, url: string }) => {
    await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const res = await fetch(`${API_BASE}/gallery`);
    setGalleryItems(await res.json());
  };

  const addReel = async (reel: { title: string, coverImage: string, videoUrl: string, type: string }) => {
    await fetch(`${API_BASE}/reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reel)
    });
    const res = await fetch(`${API_BASE}/reels`);
    setReels(await res.json());
  };

  const removeReel = async (id: string) => {
    await fetch(`${API_BASE}/reels/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API_BASE}/reels`);
    setReels(await res.json());
  };

  const updateReel = async (id: string, reel: { title: string, coverImage: string, videoUrl: string, type: 'photo_camera' | 'smart_display' }) => {
    await fetch(`${API_BASE}/reels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reel)
    });
    const res = await fetch(`${API_BASE}/reels`);
    setReels(await res.json());
  };

  const toggleBlockedDate = (date: string) => {
    const newBlocked = clinicConfig.blockedDates.includes(date)
      ? clinicConfig.blockedDates.filter(d => d !== date)
      : [...clinicConfig.blockedDates, date];
    updateClinicConfig({ ...clinicConfig, blockedDates: newBlocked });
  };

  const toggleHoliday = (holidayName: string) => {
    const newHolidays = clinicConfig.holidays.includes(holidayName)
      ? clinicConfig.holidays.filter(h => h !== holidayName)
      : [...clinicConfig.holidays, holidayName];
    updateClinicConfig({ ...clinicConfig, holidays: newHolidays });
  };

  const setEmergencyClosed = (closed: boolean) => {
    setEmergencyClosedState(closed);
    localStorage.setItem('dermelixir_emergency_closed', String(closed));
  };

  const addBeforeAfter = async (item: Omit<BeforeAfterItem, '_id'>) => {
    await fetch(`${API_BASE}/beforeafter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const res = await fetch(`${API_BASE}/beforeafter`);
    setBeforeAfterItems(await res.json());
  };

  const deleteBeforeAfter = async (id: string) => {
    await fetch(`${API_BASE}/beforeafter/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API_BASE}/beforeafter`);
    setBeforeAfterItems(await res.json());
  };

  const fetchSkinLeads = async () => {
    const res = await fetch(`${API_BASE}/skinleads`);
    setSkinLeads(await res.json());
  };

  const submitSkinLead = async (lead: Omit<SkinLead, '_id' | 'status'>) => {
    const res = await fetch(`${API_BASE}/skinleads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    const data = await res.json();
    return data;
  };

  const deleteSkinLead = async (id: string) => {
    await fetch(`${API_BASE}/skinleads/${id}`, { method: 'DELETE' });
    await fetchSkinLeads();
  };

  const updateSkinLeadStatus = async (id: string, status: string) => {
    await fetch(`${API_BASE}/skinleads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await fetchSkinLeads();
  };

  const loginPatientWithGoogle = async (email: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setPatientToken(data.token);
        localStorage.setItem('dermelixir_patient_token', data.token);
        setCurrentPatient(data.patient);
        setPatientAppointments(data.appointments || []);
      }
      return data;
    } catch (err) {
      console.error('Google login error:', err);
      return { success: false, message: 'Failed to connect to authentication server' };
    }
  };

  const logoutPatient = () => {
    setPatientToken(null);
    localStorage.removeItem('dermelixir_patient_token');
    setCurrentPatient(null);
    setPatientAppointments([]);
    setView('landing');
  };

  const loadPatientProfile = async () => {
    if (!patientToken) return;
    try {
      const res = await fetch(`${API_BASE}/auth/patient-profile`, {
        headers: {
          'Authorization': `Bearer ${patientToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPatient(data.patient);
        setPatientAppointments(data.appointments || []);
      } else {
        logoutPatient();
      }
    } catch (error) {
      console.error('Error loading patient profile:', error);
    }
  };

  const updatePatientProfile = async (name: string, mobile: string, age?: number) => {
    if (!patientToken) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch(`${API_BASE}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patientToken}`
        },
        body: JSON.stringify({ name, mobile, age })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPatient(data.patient);
      }
      return data;
    } catch (error) {
      console.error('Error updating patient profile:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  const addBlogPost = async (post: Omit<BlogPost, '_id'> | FormData) => {
    const isFormData = post instanceof FormData;
    await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? post : JSON.stringify(post)
    });
    const res = await fetch(`${API_BASE}/blogs`);
    setBlogs(await res.json());
  };

  const deleteBlogPost = async (id: string) => {
    await fetch(`${API_BASE}/blogs/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API_BASE}/blogs`);
    setBlogs(await res.json());
  };

  const updateBlogPost = async (id: string, post: Partial<BlogPost> | FormData) => {
    const isFormData = post instanceof FormData;
    await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? post : JSON.stringify(post)
    });
    const res = await fetch(`${API_BASE}/blogs`);
    setBlogs(await res.json());
  };

  /* ── TESTIMONIALS ─────────────────────────────────────────────────────── */
  const fetchVideoTestimonials = async () => {
    try {
      const res = await fetch(`${API_BASE}/testimonials/videos/all`);
      const data = await res.json();
      setVideoTestimonials(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  const addVideoTestimonial = async (v: Omit<VideoTestimonial, '_id'>) => {
    await fetch(`${API_BASE}/testimonials/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });
    await fetchVideoTestimonials();
  };

  const deleteVideoTestimonial = async (id: string) => {
    await fetch(`${API_BASE}/testimonials/videos/${id}`, { method: 'DELETE' });
    await fetchVideoTestimonials();
  };

  const updateVideoTestimonial = async (id: string, v: Partial<VideoTestimonial>) => {
    await fetch(`${API_BASE}/testimonials/videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });
    await fetchVideoTestimonials();
  };

  const fetchPhotoTestimonials = async () => {
    try {
      const res = await fetch(`${API_BASE}/testimonials/photos/all`);
      const data = await res.json();
      setPhotoTestimonials(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  const addPhotoTestimonial = async (p: Omit<PhotoTestimonial, '_id'>) => {
    await fetch(`${API_BASE}/testimonials/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    await fetchPhotoTestimonials();
  };

  const deletePhotoTestimonial = async (id: string) => {
    await fetch(`${API_BASE}/testimonials/photos/${id}`, { method: 'DELETE' });
    await fetchPhotoTestimonials();
  };

  const updatePhotoTestimonial = async (id: string, p: Partial<PhotoTestimonial>) => {
    await fetch(`${API_BASE}/testimonials/photos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    await fetchPhotoTestimonials();
  };

  useEffect(() => {
    if (patientToken) {
      loadPatientProfile();
    }
  }, [patientToken]);

  useEffect(() => {
    fetchVideoTestimonials();
    fetchPhotoTestimonials();
  }, []);

  return (
    <AppContext.Provider value={{
      view,
      setView,
      isAuthenticated,
      setIsAuthenticated,
      appointments,
      fetchAppointments,
      deleteAppointment,
      updateAppointmentStatus,
      addAppointment,
      clinicConfig,
      updateClinicConfig,
      blockedDates: clinicConfig.blockedDates,
      toggleBlockedDate,
      holidays: clinicConfig.holidays,
      toggleHoliday,
      emergencyClosed,
      setEmergencyClosed,
      selectedTreatmentForBooking,
      setSelectedTreatmentForBooking,
      adminSearchQuery,
      setAdminSearchQuery,
      galleryItems,
      addGalleryItem,
      removeGalleryItem,
      updateGalleryItem,
      reels,
      addReel,
      removeReel,
      updateReel,
      lockSlot,
      initiatePayment,
      verifyPayment,
      beforeAfterItems,
      addBeforeAfter,
      deleteBeforeAfter,
      skinLeads,
      fetchSkinLeads,
      submitSkinLead,
      deleteSkinLead,
      updateSkinLeadStatus,
      totalPages,
      totalRecords,
      patientToken,
      currentPatient,
      patientAppointments,
      loginPatientWithGoogle,
      logoutPatient,
      loadPatientProfile,
      updatePatientProfile,
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
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
