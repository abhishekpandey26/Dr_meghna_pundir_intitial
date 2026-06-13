import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, ClinicConfig, ReelInsight } from '../types';

export type AppView = 'landing' | 'booking' | 'admin' | 'admin-login';

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
  setView: (view: AppView) => void;
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
  reels: ReelInsight[];
  addReel: (reel: { title: string, coverImage: string, videoUrl: string, type: 'photo_camera' | 'smart_display' }) => Promise<void>;
  removeReel: (id: string) => Promise<void>;
  lockSlot: (date: string, startTime: string) => Promise<any>;
  initiatePayment: (data: any) => Promise<any>;
  verifyPayment: (paymentId: string, paymentRequestId: string, appointmentId: string) => Promise<any>;
  totalPages: number;
  totalRecords: number;
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
      const [configRes, apptsRes, galleryRes, reelsRes] = await Promise.all([
        fetch(`${API_BASE}/config`),
        fetch(`${API_BASE}/appointments`),
        fetch(`${API_BASE}/gallery`),
        fetch(`${API_BASE}/reels`)
      ]);

      const configData = await configRes.json();
      const apptsData = await apptsRes.json();
      const galleryData = await galleryRes.json();
      const reelsData = await reelsRes.json();

      setClinicConfig(configData);
      setAppointments(apptsData.appointments ?? (Array.isArray(apptsData) ? apptsData : []));
      if (apptsData.totalPages) setTotalPages(apptsData.totalPages);
      if (apptsData.totalRecords) setTotalRecords(apptsData.totalRecords);
      setGalleryItems(galleryData);
      setReels(reelsData);
    } catch (err) {
      console.error('Failed to sync with Medical Hub:', err);
    }
  };

  const setView = (newView: AppView) => {
    setViewState(newView);
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
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
    if (res.ok) await fetchAppointments();
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
      reels,
      addReel,
      removeReel,
      lockSlot,
      initiatePayment,
      verifyPayment,
      totalPages,
      totalRecords
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
