import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { SEO } from './SEO';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { 
  ArrowLeft, Phone, Calendar, Clock, MapPin, Star, Heart, 
  Award, FileText, CheckCircle2, ChevronRight, Video, 
  User, Check, Sparkles, MessageCircle, Navigation, ExternalLink 
} from 'lucide-react';
import { InstagramSection } from './InstagramSection';

// Count-up hook for stats
const useCountUp = (target: number, decimals: number = 0, duration: number = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = progress * target;
      setCount(Number(value.toFixed(decimals)));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, decimals, duration]);

  return count;
};

// Framer Motion Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: { 
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  show: { 
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  show: { 
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  }
};

export const AboutView: React.FC = () => {
  const {
    setSelectedTreatmentForBooking,
    patientToken,
    currentPatient,
    loginPatientWithGoogle,
  } = useApp();
  const navigate = useNavigate();

  const [activeVideoOpen, setActiveVideoOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Stats Counters
  const countExp = useCountUp(10, 0, 1800);
  const countPatients = useCountUp(1000, 0, 1800);
  const countRating = useCountUp(4.8, 1, 1800);
  const countReviews = useCountUp(57, 0, 1800);

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
      <SEO title="About Dr. Megha Pundir Singh" description="Learn about Dr. Megha Pundir Singh, founder of Derm Elixir." />
      
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
            <span className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors cursor-default" style={{ color: 'var(--rose)' }}>About</span>
            <button onClick={() => navigate('/')} className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer bg-transparent border-0 p-0" style={{ color: 'var(--ink)' }}>Home</button>
            <button onClick={() => navigate('/testimonials')} className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer bg-transparent border-0 p-0" style={{ color: 'var(--ink)' }}>Testimonials</button>
            <button onClick={() => navigate('/skin-analyzer')} className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer bg-transparent border-0 p-0" style={{ color: 'var(--ink)' }}>AI Skin Scan</button>
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

      {/* Spacer for navbar */}
      <div className="h-[68px]" />

      {/* ── SECTION 1: DOCTOR BIO HERO ───────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-16 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left - content panel */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 space-y-6"
          >
            <motion.span
              variants={staggerItem}
              className="inline-block text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--rose)' }}
            >
              Varanasi's Trusted Dermatologist
            </motion.span>

            <motion.h1
              variants={staggerItem}
              className="font-serif leading-[1.08] tracking-tight text-4xl sm:text-5xl md:text-[58px] font-semibold"
              style={{ color: 'var(--ink)' }}
            >
              Dr. Megha<br />
              <span style={{ color: 'var(--rose)' }}>Pundir Singh</span>
            </motion.h1>

            <motion.div
              variants={staggerItem}
              style={{ width: '48px', height: '2px', background: 'var(--rose)' }}
            />

            <motion.p
              variants={staggerItem}
              className="text-sm md:text-base leading-relaxed max-w-lg"
              style={{ color: 'var(--ink)', opacity: 0.75 }}
            >
              Dr. Megha Pundir Singh is a board-certified dermatologist (MBBS, MD — Skin &amp; V.D.) with over a decade of clinical experience. She founded Derm Elixir to bring advanced, science-backed skin, hair &amp; laser care to Varanasi — treating every patient with the same personal attention she'd want for her own family.
            </motion.p>

            {/* Qualification pills */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-3 items-center">
              <span className="text-[11px] font-medium uppercase tracking-widest mr-1" style={{ color: 'var(--ink)', opacity: 0.5 }}>Credentials:</span>
              <span
                className="px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                MBBS
              </span>
              <span
                className="px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                MD (Skin &amp; V.D.)
              </span>
            </motion.div>

            {/* Stat counters */}
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-4 gap-4 md:gap-6 py-6 border-y"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="text-center pr-2 border-r" style={{ borderColor: 'var(--border)' }}>
                <div className="font-serif font-bold text-2xl md:text-3xl" style={{ color: 'var(--ink)' }}>{countExp}+</div>
                <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: 'var(--rose)' }}>Years Exp</div>
              </div>
              <div className="text-center pr-2 border-r" style={{ borderColor: 'var(--border)' }}>
                <div className="font-serif font-bold text-2xl md:text-3xl" style={{ color: 'var(--ink)' }}>{countPatients}+</div>
                <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: 'var(--rose)' }}>Patients</div>
              </div>
              <div className="text-center pr-2 border-r" style={{ borderColor: 'var(--border)' }}>
                <div className="font-serif font-bold text-2xl md:text-3xl" style={{ color: 'var(--ink)' }}>{countRating}★</div>
                <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: 'var(--rose)' }}>Rating</div>
              </div>
              <div className="text-center">
                <div className="font-serif font-bold text-2xl md:text-3xl" style={{ color: 'var(--ink)' }}>{countReviews}</div>
                <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: 'var(--rose)' }}>Reviews</div>
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-4 items-center pt-1">
              <button
                onClick={() => startBooking()}
                className="px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-full text-white cursor-pointer shadow-md hover:shadow-lg hover:opacity-90 active:scale-95 transition-all bg-transparent border-0"
                style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-dark) 100%)' }}
              >
                Book a Consultation
              </button>
              <button
                onClick={() => setActiveVideoOpen(true)}
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer border bg-white hover:bg-neutral-50 transition-all flex items-center gap-2"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                Watch Introduction <Video className="w-4 h-4" style={{ color: 'var(--rose)' }} />
              </button>
            </motion.div>
          </motion.div>

          {/* Right - full-bleed real photo */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 relative"
          >
            <div className="relative w-full h-[420px] sm:h-[520px] md:h-[600px] lg:h-[640px] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="/megha_pundir_singh_coat.jpg"
                alt="Dr. Megha Pundir Singh"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.8 }}
              className="absolute bottom-6 left-6 lg:-bottom-6 lg:-left-8 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-30 flex items-start gap-3 border border-stone-100 max-w-sm"
            >
              <div className="p-2.5 rounded-xl bg-[var(--blush)] text-[var(--rose)] mt-0.5 flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-base text-[var(--rose)] leading-tight">Derm Elixir</h4>
                <p className="text-xs text-neutral-500 font-medium tracking-wide mt-1 leading-normal">
                  Skin · Hair · Laser Clinic
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--rose)]" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Samne Ghat, Varanasi</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 2: PHILOSOPHY ─────────────────────────────────────────── */}
      <section className="py-24 px-5 md:px-16 bg-[var(--cream)] overflow-hidden relative">
        {/* Large quote icon in background */}
        <div className="absolute top-10 left-10 text-[var(--rose)] font-serif text-[180px] font-bold leading-none opacity-[0.06] select-none pointer-events-none">
          “
        </div>

        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
          <div className="text-center">
            <span className="text-xs uppercase font-bold tracking-[0.2em]" style={{ color: 'var(--rose)' }}>Her Philosophy</span>
            
            <motion.blockquote
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="mt-6 font-serif text-2xl md:text-3xl lg:text-[34px] leading-relaxed italic text-center font-medium"
              style={{ color: 'var(--ink)' }}
            >
              "At Derm Elixir, we believe every patient deserves personalized care that transforms not just your skin — but your confidence. Science is our method. Your glow is our goal."
            </motion.blockquote>
            
            <div className="mt-4 font-serif text-base font-semibold text-stone-500">— Dr. Megha Pundir Singh</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-4 border-t border-[var(--border)]">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="text-sm md:text-base leading-relaxed text-stone-600 space-y-4"
            >
              <p>
                Dr. Megha Pundir Singh completed her MBBS and MD in Dermatology from a prestigious medical institution. With over 10 years of clinical practice in Varanasi, she has transformed thousands of lives through science-backed, personalized dermatological care.
              </p>
            </motion.div>
            
            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="text-sm md:text-base leading-relaxed text-stone-600 space-y-4"
            >
              <p>
                At Derm Elixir, she has built Varanasi's most advanced skin, hair & laser clinic — bringing treatments that were once available only in metropolitan cities, directly to Varanasi. Her approach integrates medical dermatology, cosmetic science, and a deep understanding of each patient's unique needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CREDENTIALS WALL ──────────────────────────────────── */}
      <section className="py-24 px-5 md:px-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left panel - timeline/credentials */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-5 p-8 md:p-10 rounded-3xl bg-[var(--ink)] text-white shadow-xl"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--rose)' }}>Qualifications</span>
            <h3 className="font-serif text-3xl font-semibold text-white mt-2 mb-8">Professional Timeline</h3>
            
            <div className="space-y-6 relative pl-2">
              {[
                { title: "MBBS", desc: "Bachelor of Medicine & Surgery (Medical Council)" },
                { title: "MD", desc: "Dermatology, Venereology & Leprology" },
                { title: "Registered Dermatologist", desc: "Recognized by State Medical Council" },
                { title: "10+ Years Experience", desc: "Clinical practice across medical & aesthetic skincare" },
                { title: "Specialist Cosmetologist", desc: "Advanced Aesthetic Dermatology & Laser Procedures" },
                { title: "Hair Restoration Specialist", desc: "Mesotherapy & Hair Transplantation" },
                { title: "Advanced Training", desc: "Certified in Injection Aesthetics, Chemical Peels & Fillers" }
              ].map((item, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-[var(--rose)]/30 hover:border-[var(--rose)] transition-colors">
                  {/* bullet node */}
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[var(--rose)] shadow" />
                  
                  <h4 className="font-serif text-base font-semibold text-white leading-snug">{item.title}</h4>
                  <p className="text-xs text-stone-400 mt-1 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right panel - areas of expertise */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-[0.2em]" style={{ color: 'var(--rose)' }}>Areas of Expertise</span>
              <h3 className="font-serif text-3xl md:text-4xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
                Comprehensive Care Across Every Skin &amp; Hair Concern
              </h3>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                {
                  icon: <User className="w-7 h-7" />,
                  title: "Medical Dermatology",
                  desc: "Acne · Eczema · Psoriasis · Vitiligo · Nail Disorders · Pediatric Derm"
                },
                {
                  icon: <Sparkles className="w-7 h-7" />,
                  title: "Aesthetic & Cosmetic",
                  desc: "Botox · Fillers · Chemical Peels · Hydrafacial · Korean Glow · Carbon Peel"
                },
                {
                  icon: <Heart className="w-7 h-7" />,
                  title: "Hair Restoration",
                  desc: "PRP · GFC Therapy · Mesotherapy · Hair Transplant · Scalp Micropigmentation"
                },
                {
                  icon: <FileText className="w-7 h-7" />,
                  title: "Laser & Surgery",
                  desc: "Laser Hair Reduction · Tattoo Removal · Laser Toning · Mole & Wart Removal · Scar Revision"
                }
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  whileHover={{ y: -4, borderColor: 'var(--rose)', boxShadow: '0 12px 30px rgba(184,103,79,0.1)' }}
                  className="bg-[var(--blush)] border border-[var(--border)] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 bg-white text-[var(--rose)] rounded-xl w-fit shadow-sm mb-4">
                      {card.icon}
                    </div>
                    <h4 className="font-serif text-lg font-bold mb-2" style={{ color: 'var(--ink)' }}>{card.title}</h4>
                    <p className="text-xs leading-relaxed text-stone-500">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── SECTION 4: WHY PATIENTS CHOOSE HER ────────────────────────────── */}
      <section className="py-24 px-5 md:px-16 bg-[var(--blush)] overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-[0.2em]" style={{ color: 'var(--rose)' }}>Expert Standards</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold" style={{ color: 'var(--ink)' }}>
              Why Patients Choose Dr. Megha
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Personalised Treatment Plans",
                desc: "No two patients are the same. Every consultation begins with understanding your skin's unique story."
              },
              {
                title: "Evidence-Based Medicine",
                desc: "Every treatment at Derm Elixir is backed by clinical science — no shortcuts, no guesswork, only results."
              },
              {
                title: "Patient-First Approach",
                desc: "Dr. Megha personally handles every case. You speak to the doctor, not just the staff."
              },
              {
                title: "Advanced Equipment",
                desc: "Varanasi's only clinic offering treatments like GFC Therapy, Korean Glass Glow, and FDA-approved laser procedures."
              },
              {
                title: "Flexible Timings",
                desc: "Open 7 days a week including Sundays — because your skin doesn't wait for weekdays."
              },
              {
                title: "Verified Results",
                desc: "4.8 Google rating with 57 verified patient reviews — results that speak for themselves."
              }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                whileHover={{ y: -6, borderColor: 'var(--rose)', boxShadow: '0 20px 48px rgba(184,103,79,0.12)' }}
                className="bg-white border border-[var(--border)] rounded-2xl p-8 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-full bg-[var(--blush)] text-[var(--rose)] flex items-center justify-center font-bold text-lg mb-6">
                    {idx + 1}
                  </div>
                  <h4 className="font-serif text-lg font-bold mb-3" style={{ color: 'var(--ink)' }}>{card.title}</h4>
                  <p className="text-xs leading-relaxed text-stone-500 font-light">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 5: REAL PATIENT REVIEWS ───────────────────────────────── */}
      <section className="py-24 px-5 md:px-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-[0.2em]" style={{ color: 'var(--rose)' }}>Testimonials</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold" style={{ color: 'var(--ink)' }}>
              What Our Patients Say
            </h2>
            <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold">Real reviews from verified patients</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                name: "Addy S",
                text: "Mujhe hairfall ki bhot jyda problem thi, bhot se doctor ko consult kiya but khi se koi response ni mila. Fir mai Dr Megha mam se mili — unhone mera treatment kiya, ab mujhe hairfall ki problem bilkul nhi hai. Totally satisfied!"
              },
              {
                name: "Hema S",
                text: "She is very knowledgeable and experienced. Maine laser toning karaya, skin me ab pahle se firmness hai. Achha feel hota hai."
              },
              {
                name: "Syeed M",
                text: "Mere chehre par purane acne scars the, aur self-confidence kaafi low ho gaya tha. Dr Megha se consult kiya — unke diye gaye treatment se daag dheere-dheere halka hone laga."
              }
            ].map((review, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="bg-[var(--blush)] border border-[var(--border)] rounded-2xl p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm italic leading-relaxed text-stone-600">
                    "{review.text}"
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-8 pt-4 border-t border-stone-200/50">
                  <div className="w-8 h-8 rounded-full bg-[var(--rose)]/10 text-[var(--rose)] flex items-center justify-center font-bold text-xs uppercase">
                    {review.name.slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-semibold" style={{ color: 'var(--ink)' }}>{review.name}</h5>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Patient</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center pt-8 space-y-4">
            <div className="flex justify-center items-center gap-2 text-lg font-medium font-serif" style={{ color: 'var(--ink)' }}>
              {/* Colored Google G SVG */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>4.8 ★★★★★ · 57 Google Verified Reviews</span>
            </div>
            
            <a 
              href="https://maps.app.goo.gl/tVbQy7kL5WnFp1Y17" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold tracking-wide border-b border-transparent hover:border-[var(--rose)] transition-colors cursor-pointer"
              style={{ color: 'var(--rose)' }}
            >
              Read All Reviews on Google <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: CLINIC GALLERY ─────────────────────────────────────── */}
      <section className="py-24 px-5 md:px-16 bg-[var(--cream)] overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-[0.2em]" style={{ color: 'var(--rose)' }}>Derm Elixir Spaces</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold" style={{ color: 'var(--ink)' }}>
              Inside Derm Elixir
            </h2>
            <p className="text-sm max-w-xl mx-auto text-stone-500 leading-relaxed">
              A premium dermatology experience in the heart of Varanasi.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { src: "/clinic_interior.png", label: "Clinic Reception" },
              { src: "/hydrafacial_procedure.png", label: "Treatment Room" },
              { src: "/img1.webp", label: "Clinical Consultation" },
              { src: "/img2.webp", label: "Skin & Hair Therapy Setup" },
              { src: "/img3.webp", label: "Aesthetics Care Room" },
              { src: "/meghna_Ai.jpg", label: "Consultation Table" }
            ].map((img, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="relative aspect-video rounded-2xl overflow-hidden shadow-sm group cursor-pointer"
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Hover overlay details */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center z-20">
                  <span className="text-white text-xs font-bold uppercase tracking-[0.2em] border border-white/40 px-5 py-2 rounded-full backdrop-blur-md">
                    VIEW
                  </span>
                  <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest mt-3">
                    {img.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Instagram Section */}
      <InstagramSection />

      {/* ── SECTION 7: VISIT US / CTA FOOTER ─────────────────────────────── */}
      <section className="py-24 px-5 md:px-16 bg-[var(--ink)] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left - Contact Details */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="space-y-4">
              <span className="text-[10px] text-[var(--rose)] font-bold uppercase tracking-[0.2em]">Contact us</span>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-white leading-tight">
                Visit Derm Elixir
              </h2>
            </div>

            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[var(--rose)] flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-white">Address</h4>
                  <p className="text-xs text-stone-400 mt-1.5 leading-normal">
                    N1/66, Inside Gyandeep Medicare Hospital,<br />
                    Nagwa Road, Samne Ghat, Varanasi — 221005
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[var(--rose)] flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-white">Phone</h4>
                  <p className="text-xs text-stone-400 mt-1.5 leading-normal">
                    +91 80037 67830
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[var(--rose)] flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-white">Timings</h4>
                  <p className="text-xs text-stone-400 mt-1.5 leading-normal">
                    Mon–Sat: 10:00 AM – 7:00 PM<br />
                    Sunday: 12:00 PM – 4:00 PM
                  </p>
                </div>
              </div>

            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="tel:+918003767830"
                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-full text-[var(--ink)] bg-white cursor-pointer hover:bg-neutral-100 transition-all flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--rose)]" /> Call Now
              </a>
              
              <a
                href="https://wa.me/918003767830?text=Hi%20Dr.%20Megha%2C%20I%20would%20like%20to%20book%20a%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-full text-white cursor-pointer transition-all hover:opacity-90 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-dark) 100%)' }}
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>

              <a
                href="https://maps.app.goo.gl/tVbQy7kL5WnFp1Y17"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-full text-white cursor-pointer border border-white/20 hover:border-[var(--rose)] transition-all flex items-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5 text-[var(--rose)]" /> Directions
              </a>
            </div>
          </motion.div>

          {/* Right - Map embed */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-6 h-[350px] overflow-hidden rounded-2xl border border-white/10 shadow-lg"
          >
            <iframe
              title="Dermelixir Location Map"
              allowFullScreen={true}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.729792078696!2d83.0044547!3d25.2798418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2de26f74f767%3A0xc3f8373b9e4a3075!2sSamne%20Ghat%2C%20Lanka%2C%20Varanasi%2C%20Uttar%20Pradesh%20221005!5e0!3m2!1sen!2sin!4v1715678901234!5m2!1sen!2sin"
            />
          </motion.div>

        </div>
      </section>

      {/* ── VIDEO MODAL ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setActiveVideoOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1 text-xs uppercase font-bold tracking-widest cursor-pointer bg-transparent border-0"
            >
              Close <span className="text-lg">×</span>
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <iframe
                src="https://www.youtube.com/embed/2s5b-zI_KLo?autoplay=1"
                title="Dr. Megha Introduction"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
