import { Appointment, Review, TreatmentInfo, ReelInsight, ClinicConfig } from './types';

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt_1',
    patientName: 'Saanvi Sharma',
    patientId: 'P-10294',
    patientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRmg7g5F7lYGwoGL4jJiOZG48Jckh5DN-4fvamvyhy5aXfuVfIJ4pjSx3j8nM5eQ3fwKSF3wJTi0NznjLADSs9LNKjAiQohzjzx7EzfrF3Qm6RT8sG64RuErmlViIZIkV0HFHz-OKHy0I2q6WDUkAkujJCL5Gzmr0rpqDkV2gRA4RKfXlZXC_6omszEE4bcDT55qyKZsRz4TpQIVwsfvCYNFN1Q0kytJuIGjzp_NZrLLTQMj4XlSVkjIIAkh-WpeiRCvznMwHv7M8',
    treatment: 'Hydrafacial Deluxe',
    time: '10:30 AM',
    date: 'Oct 15',
    status: 'Approved',
    mobile: '+91 98112 04321',
    email: 'saanvi.s@gmail.com',
    age: 26,
    concern: 'Desire skin hydration and glow before festive season.',
    createdAt: '2026-06-10T08:15:00Z'
  },
  {
    id: 'appt_2',
    patientName: 'Arjun Kapoor',
    patientId: 'P-11005',
    patientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhJA4BXuzHFkuoboXL4JV0zKJPPGl0PAWIarol0spoBFQ_fT18E6Rs9ytsjJigmUb1njJDWe1C-KMdf03fB8jpzvSq1GB5wbH6eRxKHLaJtKEvSo_BUpUZLyMF6tSZJZcV-qjjTiW6P8gTDlq_vQ3oyQB55OJMZQzI-ZRjkmX6uxYEnXpBzurVavddAkTtYkFdROvGN_y8Kv2s3FZ8a7r_T0g2k4-Zib8emhKunKZXUbk01u0LAhNeTWnmB2eYnrGAfCe07U3azBw',
    treatment: 'Dermato-Consult',
    time: '11:15 AM',
    date: 'Oct 15',
    status: 'Pending',
    mobile: '+91 99887 76655',
    email: 'arjun.k@yahoo.com',
    age: 32,
    concern: 'Mild eczema flare-up on elbow and forearm.',
    createdAt: '2026-06-11T09:12:00Z'
  },
  {
    id: 'appt_3',
    patientName: 'Priya Patel',
    patientId: 'P-10922',
    patientAvatar: '', // will fallback to letters PP
    treatment: 'Acne Therapy',
    time: '12:00 PM',
    date: 'Oct 15',
    status: 'Approved',
    mobile: '+91 74011 23456',
    email: 'priya.patel@rediffmail.com',
    age: 21,
    concern: 'Stubborn acne breakouts on forehead and cheeks.',
    createdAt: '2026-06-09T14:22:00Z'
  },
  {
    id: 'appt_4',
    patientName: 'Rohan Malhotra',
    patientId: 'P-10884',
    patientAvatar: '',
    treatment: 'Laser Resurfacing',
    time: '02:30 PM',
    date: 'Oct 16',
    status: 'Approved',
    mobile: '+91 91123 45678',
    email: 'rohan.malhotra@gmail.com',
    age: 38,
    concern: 'Wants to minimize deep rolling acne scars.',
    createdAt: '2026-06-10T11:45:00Z'
  },
  {
    id: 'appt_5',
    patientName: 'Kirti Sen',
    patientId: 'P-11102',
    patientAvatar: '',
    treatment: 'Hair Restoration',
    time: '04:10 PM',
    date: 'Oct 16',
    status: 'Pending',
    mobile: '+91 88001 22334',
    email: 'kirti.sen@outlook.com',
    age: 29,
    concern: 'Severe hair thinning on top scalp region.',
    createdAt: '2026-06-11T07:30:00Z'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev_1',
    author: 'Rahul Kapoor',
    initials: 'RK',
    rating: 5,
    comment: 'Best dermatologist in Varanasi. Dr. Megha explained my skin condition very clearly and the laser treatment for acne scars gave visible results in just 2 sessions.'
  },
  {
    id: 'rev_2',
    author: 'Sneha Verma',
    initials: 'SV',
    rating: 5,
    comment: 'I visited for hair fall treatment. The consultation was very professional and the medications suggested were very effective. Highly recommend for any skin or hair issues.'
  },
  {
    id: 'rev_3',
    author: 'Anshul Mishra',
    initials: 'AM',
    rating: 5,
    comment: 'Very clean and modern clinic. Dr. Megha is very polite and takes time to listen to all concerns. The staff is also very helpful. Booking was very easy.'
  }
];

export const TREATMENTS: TreatmentInfo[] = [
  {
    id: 'treatment_1',
    name: 'Medical Skincare',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    description: 'Bespoke medical aesthetic solutions tailored to your unique biology.',
    icon: 'face_6',
    subservices: ['Advanced Acne Control', 'Pigmentation Therapy', 'Medical Peels']
  },
  {
    id: 'treatment_2',
    name: 'Laser Technology',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSLythsS-Gt6t2Zq6jBdnr9iiErEkaZa-uoZ5yVlsKUBqS330ZxZAquC6O&s=10',
    description: 'US-FDA approved laser technologies calibrated precisely for flawless skin.',
    icon: 'flare',
    subservices: ['Laser Hair Reduction', 'Tattoo Removal', 'Scar Revision']
  },
  {
    id: 'treatment_3',
    name: 'Hair Restoration',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlNWamgMh51yDhqAfnwt596Tbb6qsMTaVJp7bVbaW26oNpT0oKxls6dME&s=10',
    description: 'Comprehensive scalp revitalization using advanced growth factor concentrates.',
    icon: 'face',
    subservices: ['PRP & Mesotherapy', 'Hair Fall Diagnosis', 'Scalp Rejuvenation']
  },
  {
    id: 'treatment_4',
    name: 'Medical Consult',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80',
    description: 'Personalized private consultation and diagnostics with Dr. Megha Singh.',
    icon: 'medical_services',
    subservices: ['1-on-1 skin diagnostic', 'Detailed blood work evaluation', 'Custom treatment roadmap']
  }
];

export const REELS: ReelInsight[] = [
  {
    id: 'reel_1',
    title: 'Laser Hair Removal FAQs',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9WgYwbcDvdg-HeU76gteBFH30qsG54Z_uDNeeUb2naHQDj8gQO3hwS5XIX-FsJEEjxzNHfK4KJEU5YTtH8FKJWkO1tHhlgTX6R1qagO2m9kAlpO2cPjo2iH4lGCJ43JeDWhSeEiLFw9nD7G6u_mfVUFhZchCCezF9o0wiIjWhBLU9VThxGf4uM3OpwucBcH6y8G6hulW1gNl9ohyDMt1Zdz0z8xnDiWxZwUpq7PoHRZM6j4xG9fa8oV_bXIsiTS94xhlcpvKdJOk',
    videoUrl: 'https://www.youtube.com/shorts/qM79p9xR-8o',
    type: 'photo_camera'
  },
  {
    id: 'reel_2',
    title: 'Acne Care Routine',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJrvKYONrWnTApfmcII08m7PiHczX7T1T0dH-GSrcwqJpf26DVKJE9EyruYR7iaB6goIyWo_IzFl06V7mq0u-doaUKsBMxta9WPUDtYSHvYK77Gc0jlIgD54laWMP9JNclXeSaHUguMG3QF7nrRDsIIDN3OtdxEm736pDB_8oRqgYslCWOLlqYTFpPB93X4N2SdEQHciTN8uw1OxGChiCxMtanjYC6I59kvnjETj-2y-1Y4N4SXE4VHgLKN8KDAhbWUFmJTQLFtL8',
    videoUrl: 'https://www.youtube.com/shorts/qM79p9xR-8o',
    type: 'smart_display'
  },
  {
    id: 'reel_3',
    title: 'Hydrafacial Benefits',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYtcTKb2aSGxPz9yBLO4GVYzN4usGe2MPgeajlOUyydeqVJwNqaiwyZVjeZ9Vg-r20Wra90LWW5i0kzqrgO4jtb4LT1aFFV-AR-TXvSjBG7DkRIrl3pjIzVbETmB2SStUmvMlUqSLHk8qeyCwE5ETfdgfvb5QmFaGGGYOHbDCJHvt328mhlclaSCrEKgSWkX1ASqm1b4O34HBfnjoJOnDVqvPkackYzQadjVC4rPgcYhafEG0qfQ6A0rDN5gDi5WB_AxTNa7W9mWM',
    videoUrl: 'https://www.youtube.com/shorts/qM79p9xR-8o',
    type: 'photo_camera'
  },
  {
    id: 'reel_4',
    title: 'Anti-Aging Tips',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL7mHSMXd6jh-nKsGZl0IH8JwrsWIhGUJNH1lvAIVdSvkMGBP7f4PFTNPl_X81r2ExP06ObgeDMvlJhcqyDbC4xK8FcdyRS9n36oMvaWrS7M-8iFOjEKn0rkkHCkm9S4kZ-xcXS-OVH8F5dPalUPSbY7mQQi8Bk5NEBEe_qFTOxvJ3x1GwVWbyVmZCvmidFwEZahpcbZo1Y74sGY4PrgcKCMNoiPZFgq9dUD9rN6mhxn2ERlGp651q9JtM_liLGqDfJuPc88F1bms',
    videoUrl: 'https://www.youtube.com/shorts/qM79p9xR-8o',
    type: 'smart_display'
  }
];

export const GALLERY_ITEMS = [
  {
    id: 'gal_1',
    title: 'Treatment Room',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNELag08dQ13JQWCZwEpiIo60fS-p5dUL9k7UFyJpwFVWzehxP4yHd20OiSTr8UANNigdz9JEiFzTnxA6DeTHN3OgoV22sErCRtU1p3dAqp2KQu6fTxZBeYynKUmRdhDlseC3mwtUa71ZywvYPv3jPCWKQCJrCT0GlNaFKA8PiLQK0r_1U4y5h3UmnMBW-XACXwCwGuYefjj_aDiCjvTSy4JiXK3-6ahs0qtazNlyQPWiY4kZJtTqDKo9_bvv5VrmGbCZ0P3Ua-Bc'
  },
  {
    id: 'gal_2',
    title: 'Clinic Reception',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSNc_mUFziGR0OPBF6yVGRd6gW0YcEo4FexYu-QPkhuSEMnYAeHXjpj9ZQNVUz_yDOl4cOwB5ob62nAm_fdwhMeq1zlqVsNnxxKsHs9ToMGoOrfk2eRzuY3URlaSuRnGvcB9Pm4fF9M3nIQPknnj5hAlRqWPtc77Rr1DkKUeLPgo1Gk3UZNDOmFtq48-7Pzb5XvmM7ptQm7_9OB73S86sC1zWjmEH5fm0Gl3cAuPGsOvb8_fZQEzj61VMXh3oDdi_8UtM09xTd8xw'
  },
  {
    id: 'gal_3',
    title: 'Consultation Room',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA7dC0mUddc3NlPXdKA_xy9ImmAG70eBHz0NprBBNFiR82WmFByAiqdlbNBKWUYzGARQ69Ri--IIkwXpnpjSej1e9AMDhg6QO3W0xyglpYzCU2khXNyqCFHaVG7vyar0ShY5XgMG4pSu-dS4bAZbXzilqgsnPju6Qxis-ihmynU6nlz4HAr4AZu8snCv32BM_T-ZVFtaYLOvgOtUaNrWLGF1VE12XC_u5jUxAoM2gdVM4ADK-07nyuKtCOfK0DdOXDSzr-XfB4Zvk'
  },
  {
    id: 'gal_4',
    title: 'Advanced Equipment',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-M3lp--ZBXt9PZmYQSVyMqox_yS_qfIiuxwQtQEOAlZbgFUwZ6W0pEkUWpPVeyxNvfWnRs-uTMss4jwKnFOVwdL5JqSIjqlxDUxVoZTqxaUUzULfRTyMk3Shsl2SGSqIdu_2O6D-d9SLYjcxVmU4VF9lhO-9j1lati6DkmjwvgF1iIyv4XxAe7lfSOHPE3Hbiaik3qXcau24j4R7lVbtJrwdFlqc-ZouOA0SiIj8PmF51uflgJuWx7ihOahkoBXnykXhCCUawK_Q'
  }
];

export const CLINIC_HOUR_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

export const SLOT_DURATION_OPTIONS = [
  { value: 10, label: '10 MINUTES' },
  { value: 15, label: '15 MINUTES' },
  { value: 30, label: '30 MINUTES' },
  { value: 45, label: '45 MINUTES' },
  { value: 60, label: '60 MINUTES' }
];

export const DEFAULT_CONFIG: ClinicConfig = {
  startHour: '09:00',
  endHour: '19:30',
  slotDuration: 10,
  blockedDates: [],
  holidays: []
};
