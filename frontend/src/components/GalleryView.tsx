import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { SEO } from './SEO';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import {
  ArrowLeft, X, ChevronLeft, ChevronRight, Maximize2,
  MapPin, Phone, Clock, Award, MessageCircle, Navigation, ExternalLink
} from 'lucide-react';
import { API_BASE } from '../config';
import { InstagramSection } from './InstagramSection';

const getMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const serverBase = API_BASE.replace('/api', '');
    return `${serverBase}${url}`;
  }
  return url;
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
};

export const GalleryView: React.FC = () => {
  const {
    setSelectedTreatmentForBooking,
    patientToken,
    currentPatient,
    loginPatientWithGoogle,
    galleryItems,
  } = useApp();
  const navigate = useNavigate();

  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Keyboard navigation for lightbox
  const displayPhotos = galleryItems && galleryItems.length > 0 ? galleryItems : [
    { url: "/img2.webp", title: "Dr. Megha in clinic chair" },
    { url: "/clinic_interior.png", title: "Clinic reception" },
    { url: "/hydrafacial_procedure.png", title: "Treatment room with laser equipment" },
    { url: "/img1.webp", title: "Dr. Megha standing by clinic chair" },
    { url: "/img3.webp", title: "Derm Elixir clinic entrance" },
    { url: "/meghna_Ai.jpg", title: "Dr. Megha Pundir portrait" }
  ];

  useEffect(() => {
    if (activePhotoIdx === null || displayPhotos.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePhotoIdx(null);
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIdx(prev => (prev !== null ? (prev + 1) % displayPhotos.length : null));
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIdx(prev => (prev !== null ? (prev - 1 + displayPhotos.length) % displayPhotos.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIdx, displayPhotos.length]);

  const handleGoogleLoginClick = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        await loginPatientWithGoogle(user.email, user.displayName || '');
      }
    } catch (err: any) {
      alert('Google login failed: ' + err.message);
    }
  };

  const startBooking = (treatmentName?: string) => {
    setSelectedTreatmentForBooking(treatmentName || undefined);
    navigate('/booking');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-800" style={{ color: 'var(--ink)' }}>
      <SEO title="Gallery" description="Explore our clinic gallery." />
      
      {/* ── TOP BAR NAVIGATION ────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 w-full z-50 transition-expo bg-cream/90 backdrop-blur-md"
        style={{
          borderBottom: '1px solid var(--border)',
          height: '68px'
        }}
      >
        <div className="flex justify-between items-center px-5 h-full w-full max-w-7xl mx-auto md:px-16">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex flex-col items-start cursor-pointer text-left bg-transparent border-0 p-0">
            <span className="font-serif text-2xl font-semibold leading-none" style={{ color: 'var(--ink)' }}>Derm Elixir</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] leading-none mt-0.5" style={{ color: 'var(--terracotta)' }}>Skin · Hair · Laser</span>
          </button>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            <span className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors cursor-default" style={{ color: 'var(--rose)' }}>Gallery</span>
            <button onClick={() => navigate('/')} className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer bg-transparent border-0 p-0" style={{ color: 'var(--ink)' }}>Home</button>
            <button onClick={() => navigate('/about')} className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer bg-transparent border-0 p-0" style={{ color: 'var(--ink)' }}>About</button>
            <button onClick={() => navigate('/testimonials')} className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer bg-transparent border-0 p-0" style={{ color: 'var(--ink)' }}>Testimonials</button>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {patientToken && currentPatient ? (
              <>
                <button
                  onClick={() => navigate('/patient-portal')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] rounded-full transition-all cursor-pointer hover:opacity-80 bg-transparent"
                  style={{ border: '1px solid var(--terracotta)', color: 'var(--terracotta)' }}
                >
                  Dashboard 🚀
                </button>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow"
                  style={{ background: 'var(--terracotta)' }}
                >
                  {currentPatient.name ? currentPatient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : currentPatient.email.slice(0, 2)}
                </div>
              </>
            ) : (
              <button
                onClick={handleGoogleLoginClick}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-[0.05em] rounded-full transition-all cursor-pointer hover:opacity-80 bg-transparent"
                style={{ border: '1.5px solid var(--terracotta)', color: 'var(--terracotta)' }}
              >
                Login
              </button>
            )}
            <button
              onClick={() => startBooking()}
              className="px-5 py-2 text-xs font-semibold uppercase tracking-[0.05em] rounded-full text-white transition-all active:scale-95 cursor-pointer bg-transparent border-0"
              style={{ background: 'var(--terracotta)' }}
            >
              Book Now
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-[68px]" />

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <section 
        className="py-16 flex flex-col justify-center items-center text-center relative overflow-hidden" 
        style={{ 
          minHeight: '280px',
          background: 'url(/gallery_hero_banner.png) center/cover no-repeat'
        }}
      >
        {/* Dark linear gradient overlay to guarantee readability */}
        <div 
          className="absolute inset-0 z-10" 
          style={{ 
            background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65))'
          }} 
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-3xl px-6 space-y-4 relative z-20"
        >
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--rose)' }}>
            Derm Elixir
          </span>
          <h1 className="font-serif text-4xl md:text-[56px] font-bold text-white leading-none">
            Clinic Gallery
          </h1>
          <p className="text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto text-white/80">
            A serene, medically-equipped environment designed for your comfort and confidence.
          </p>
        </motion.div>
      </section>

      {/* ── PHOTO GRID ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-[60px]" style={{ background: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {displayPhotos.map((photo, idx) => (
              <motion.div
                key={photo._id || idx}
                variants={{
                  hidden: { scale: 0.94, opacity: 0 },
                  show: { 
                    scale: 1, 
                    opacity: 1, 
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } 
                  }
                }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setActivePhotoIdx(idx)}
                className="relative overflow-hidden rounded-2xl group cursor-pointer shadow-sm"
                style={{ height: '280px' }}
              >
                <img
                  src={getMediaUrl(photo.url)}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Hover overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-2 z-10"
                  style={{ background: 'rgba(42,33,24,0.6)' }}
                >
                  <Maximize2 className="w-5 h-5 text-white/80" />
                  <span className="text-white text-xs font-semibold uppercase tracking-[0.2em] font-sans">
                    VIEW
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── CTA STRIP BELOW GRID ────────────────────────────────────────── */}
      <section className="py-16 text-center px-6" style={{ background: 'var(--blush)' }}>
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
            Want to See Your Results Here?
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--muted)' }}>
            Book a consultation with Dr. Megha today and start your transformation.
          </p>
          <div className="pt-2">
            <button
              onClick={() => startBooking()}
              className="px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-full text-white cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95 border-0"
              style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-dark) 100%)' }}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </section>

      {/* ── FOLLOW ON INSTAGRAM ───────────────────────────────────────────── */}
      <InstagramSection />

      {/* ── LIGHTBOX DIALOG ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {activePhotoIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/92 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Top Close Button */}
            <button
              onClick={() => setActivePhotoIdx(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-0"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left navigation arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx(prev => (prev !== null ? (prev - 1 + displayPhotos.length) % displayPhotos.length : null));
              }}
              className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-0"
              title="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Lightbox Image */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              key={activePhotoIdx}
              className="w-full max-w-5xl h-auto max-h-[80vh] flex flex-col justify-center items-center select-none"
            >
              <img
                src={getMediaUrl(displayPhotos[activePhotoIdx].url)}
                alt={displayPhotos[activePhotoIdx].title}
                className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              <span className="text-white/60 text-xs uppercase tracking-widest font-sans font-semibold mt-4">
                {displayPhotos[activePhotoIdx].title} ({activePhotoIdx + 1} / {displayPhotos.length})
              </span>
            </motion.div>

            {/* Right navigation arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx(prev => (prev !== null ? (prev + 1) % displayPhotos.length : null));
              }}
              className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-0"
              title="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
