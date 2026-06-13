export interface Appointment {
  _id?: string;
  id: string; // legacy support if needed
  patientName: string;
  patientId: string;
  patientAvatar: string;
  treatment: string;
  time: string;
  startTime?: string;
  date: string; // e.g., "Oct 15"
  status: 'Approved' | 'Pending' | 'Rejected' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED';
  paymentStatus?: string;
  mobile: string;
  email: string;
  age: number;
  concern?: string;
  consultationType?: 'IN_CLINIC' | 'ONLINE';
  meetLink?: string;
  createdAt: string;
}

export interface ClinicConfig {
  startHour: string; // e.g., "09:00"
  endHour: string; // e.g., "19:30"
  slotDuration: number; // e.g., 15, 30, 45, 60
  blockedDates: string[];
  holidays: string[];
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  comment: string;
}

export interface TreatmentInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  subservices: string[];
}

export interface ReelInsight {
  _id?: string;
  id: string;
  title: string;
  coverImage: string;
  videoUrl: string;
  type: 'photo_camera' | 'smart_display';
}

export interface BeforeAfterItem {
  _id?: string;
  title: string;
  treatment: string;
  beforeUrl: string;
  afterUrl: string;
}

export interface SkinLead {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  age?: number;
  skinType?: string;
  scanResults: {
    overallScore: number;
    hydration: number;
    redness: number;
    pores: number;
    spots: number;
  };
  primaryConcern?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED';
  createdAt?: string;
}

export interface Patient {
  id: string;
  email: string;
  name?: string;
  mobile?: string;
  age?: number;
}

