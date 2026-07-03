import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useApp } from '../context/AppContext';
import { REVIEWS, TREATMENTS } from '../initialData';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { InstagramSection } from './InstagramSection';
import { API_BASE } from '../config';

const getMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const serverBase = API_BASE.replace('/api', '');
    return `${serverBase}${url}`;
  }
  return url;
};

const fallbackPhotoTestimonials = [
  {
    _id: 'fallback-1',
    title: 'Severe Vulgaris Resolution',
    treatment: 'Acne Therapy',
    beforeUrl: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=600',
    afterUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600',
    description: 'Significant clearance of inflammatory acne lesions and scabbing after a customized 4-session laser protocol.'
  },
  {
    _id: 'fallback-2',
    title: 'Laser Skin Resurfacing',
    treatment: 'Laser Resurfacing',
    beforeUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&q=80&w=600',
    afterUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    description: 'Improved skin texture, pore refinement, and tone uniformity after erbium laser rejuvenation.'
  },
  {
    _id: 'fallback-3',
    title: 'Hair Restoration Success',
    treatment: 'Hair Restoration',
    beforeUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
    afterUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    description: 'Visible density improvement and scalp rejuvenation post exosomes therapy.'
  }
];

interface CountUpProps {
  target: number;
  decimals?: number;
  duration?: number;
}

const CountUp: React.FC<CountUpProps> = ({ target, decimals = 0, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;

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
  }, [inView, target, decimals, duration]);

  return <span ref={ref}>{count}</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1, y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  show: {
    opacity: 1, x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1, x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 }
  }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1, y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: -70,
    scale: 0.92
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 12,
      mass: 0.8
    }
  }
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1
    }
  }
}

export const LandingView: React.FC = () => {
  const {
    setView,
    setSelectedTreatmentForBooking,
    galleryItems,
    reels,
    loginPatientWithGoogle,
    patientToken,
    currentPatient,
    blogs,
    videoTestimonials,
    photoTestimonials
  } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [treatmentsOpen, setTreatmentsOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const blogSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeouts: number[] = [];

    const reviewsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.review-card').forEach((card, i) => {
              const tId = window.setTimeout(() => {
                card.classList.add('card-bounce');
              }, i * 150);
              timeouts.push(tId);
            });
          } else {
            timeouts.forEach(tId => clearTimeout(tId));
            timeouts.length = 0;
            entry.target.querySelectorAll('.review-card').forEach((card) => {
              card.classList.remove('card-bounce');
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    if (reviewsSectionRef.current) {
      reviewsObserver.observe(reviewsSectionRef.current);
    }

    return () => {
      reviewsObserver.disconnect();
      timeouts.forEach(tId => clearTimeout(tId));
    };
  }, []);

  useEffect(() => {
    if (blogs.length === 0) return;

    const timeouts: number[] = [];

    const blogObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.blog-card').forEach((card, i) => {
              const tId = window.setTimeout(() => {
                card.classList.add('blog-card-animate');
              }, i * 150);
              timeouts.push(tId);
            });
          } else {
            timeouts.forEach(tId => clearTimeout(tId));
            timeouts.length = 0;
            entry.target.querySelectorAll('.blog-card').forEach((card) => {
              card.classList.remove('blog-card-animate');
            });
          }
        });
      },
      { threshold: 0.15 }
    );
    if (blogSectionRef.current) {
      blogObserver.observe(blogSectionRef.current);
    }

    return () => {
      blogObserver.disconnect();
      timeouts.forEach(tId => clearTimeout(tId));
    };
  }, [blogs]);


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

  const categories = [
    'All',
    'Laser Hair Removal',
    'Pimple',
    'Acne Scars',
    'Hair Restoration',
    'Chemical Peels',
    'Weight Loss',
    'Anti Aging'
  ];

  const startBooking = (treatmentName: string = '') => {
    setSelectedTreatmentForBooking(treatmentName);
    setView('booking');
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleTogglePlay = (id: string) => {
    setPlayingVideoId(playingVideoId === id ? null : id);
  };



  const treatmentItems = [
    { slug: 'botox', label: 'Botox & Fillers', img: '/assets/treatments/botox.jpg' },
    { slug: 'hydrafacial', label: 'Hydrafacial', img: '/assets/treatments/hydrafacial.jpg' },
    { slug: 'laser', label: 'Laser Hair Reduction', img: '/assets/treatments/laser.jpg' },
    { slug: 'prp', label: 'PRP / Hair Restoration', img: '/assets/treatments/prp.jpg' },
    { slug: 'chemical-peel', label: 'Chemical Peel', img: '/assets/treatments/chemical-peel.jpg' },
    { slug: 'acne', label: 'Acne & Scar Treatment', img: '/assets/treatments/acne.jpg' },
  ];

  const row1Cards = [
    { name: 'Acne Treatment', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80' },
    { name: 'Acne Scar Treatment', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX0RWWFn8ItmYVqAQEi4t6SxTmVhyCr7hOwGlWXnGzqQ&s=10' },
    { name: 'Pigmentation & Melasma', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3Epvr1w1L5Yr7TywIFnv09E3hCQXdi2huXnFIgVS-AA&s=10' },
    { name: 'Laser Hair Reduction', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi8uLliJZQWRrYvBHDNztuWxYy2fPUhcWxEno8s1Qu0Q&s=10' },
    { name: 'Hydrafacial', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80' },
    { name: 'Chemical Peel', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu3MW7CRKNDHaVOKkWOJ8nm6yVjpihrcnQ1q1STxy2Kw&s=10' },
    { name: 'Botox & Fillers', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAxy7WNhoIQ1jjKvjySgnq-t93nqXsC4BCp6iHuwtYmA&s=10' }
  ];

  const row2Cards = [
    { name: 'PRP Hair Restoration', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxNY75V3H8XgF9_jdzThQSNjebxh-tDgQT8WTDIugGEw&s=10' },
    { name: 'Hair Loss Treatment', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Hm_QbpAaga_a0WrIn9_RGmJ7d27q_T2sFzX-3hm90g&s=10' },
    { name: 'Dark Circles & Eye Bag', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeh96vQrFalqZQmClrYsaiotxDllzx8SDxXthL-5F9mA&s=10' },
    { name: 'Skin Rejuvenation & Glow', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80' },
    { name: 'Anti-Aging Treatment', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400&q=80' },
    { name: 'Tattoo Removal', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzNdL2uhcLd-ahSFUF9U25zCPSo36cCEF9tQ0wYg_Q2w&s=10' },
    { name: 'Mole & Wart Removal', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk-QMe9KGocF9J7m-T6hlOTGzORbVs43u1S9K4fTIU_g&s=10' }
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'var(--cream)', color: 'var(--ink)' }}
    >


      {/* ── MAIN NAVBAR ──────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 w-full z-50 transition-expo"
        style={{
          background: 'var(--cream)',
          borderBottom: '1px solid var(--border)',
          height: '68px'
        }}
      >
        <div className="flex justify-between items-center px-5 h-full w-full max-w-7xl mx-auto md:px-16">

          {/* Logo */}
          <button onClick={() => setView('landing')} className="flex flex-col items-start cursor-pointer">
            <span className="font-serif text-2xl font-semibold leading-none" style={{ color: 'var(--ink)' }}>Derm Elixir</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] leading-none mt-0.5" style={{ color: 'var(--terracotta)' }}>Skin · Hair · Laser</span>
          </button>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            <button 
              onClick={() => setView('about')}
              className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer bg-transparent border-0 p-0" 
              style={{ color: 'var(--ink)' }}
            >
              About
            </button>

            {/* Treatments Mega-Dropdown */}
            <div className="relative mega-trigger">
              <button
                onClick={() => setTreatmentsOpen(!treatmentsOpen)}
                className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer"
                style={{ color: 'var(--ink)' }}
              >
                Treatments
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="mt-0.5 opacity-50">
                  <path d="M1 3l4 4 4-4" />
                </svg>
              </button>
              <div className="mega-dropdown p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--terracotta)' }}>Skin</p>
                    {['Acne Treatment', 'Pigmentation', 'Melasma Therapy', 'Anti-Aging'].map(item => (
                      <button key={item} onClick={() => startBooking(item)}
                        className="block w-full text-left text-sm py-2 px-3 rounded-lg font-medium transition-all cursor-pointer"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--blush)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >{item}</button>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--terracotta)' }}>Hair</p>
                    {['PRP Therapy', 'GFC Treatment', 'Hair Transplant', 'Hair Fall Control'].map(item => (
                      <button key={item} onClick={() => startBooking(item)}
                        className="block w-full text-left text-sm py-2 px-3 rounded-lg font-medium transition-all cursor-pointer"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--blush)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >{item}</button>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--terracotta)' }}>Aesthetics</p>
                    {['Botox', 'Dermal Fillers', 'Carbon Peel', 'Korean Glow Facial'].map(item => (
                      <button key={item} onClick={() => startBooking(item)}
                        className="block w-full text-left text-sm py-2 px-3 rounded-lg font-medium transition-all cursor-pointer"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--blush)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >{item}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setView('skin-analyzer')} className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer" style={{ color: 'var(--ink)' }}>AI Skin Scan</button>
            <button onClick={() => setView('gallery')} className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70 cursor-pointer" style={{ color: 'var(--ink)' }}>Gallery</button>
            <a href="#transformations" className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70" style={{ color: 'var(--ink)' }}>Before & After</a>
            <a href="#reviews" className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70" style={{ color: 'var(--ink)' }}>Reviews</a>
            <a href="#contact" className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:opacity-70" style={{ color: 'var(--ink)' }}>Contact</a>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {patientToken && currentPatient ? (
              <>
                <button
                  onClick={() => setView('patient-portal')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] rounded-full transition-all cursor-pointer hover:opacity-80"
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
                className="px-5 py-2 text-xs font-semibold uppercase tracking-[0.05em] rounded-full transition-all cursor-pointer hover:opacity-80"
                style={{ border: '1.5px solid var(--terracotta)', color: 'var(--terracotta)', background: 'transparent' }}
              >
                Login
              </button>
            )}
            <button
              onClick={() => startBooking()}
              className="px-5 py-2 text-xs font-semibold uppercase tracking-[0.05em] rounded-full text-white transition-all active:scale-95 cursor-pointer"
              style={{ background: 'var(--terracotta)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-accent)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--terracotta)')}
            >
              Book Now
            </button>
          </div>

        </div>
      </header>

      {/* Spacer for fixed navbar */}
      <div style={{ height: '68px' }} />

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      {/* Zone 1: video with a single minimal bordered text block — no buttons/stats overlaid */}
      <section className="relative h-[78vh] md:h-[82vh] min-h-[480px] w-full overflow-hidden flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full z-0 object-cover object-center"
          poster="/clinic_interior.png"
        >
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>

        {/* Light dark tint, just enough for the bordered box to sit legibly */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 px-6"
        >
          <div className="border border-white/40 px-10 sm:px-16 md:px-20 py-7 md:py-9 text-center bg-black/10 backdrop-blur-[1px]">
            <p className="font-serif uppercase tracking-[0.12em] text-white text-xl sm:text-2xl md:text-3xl">
              Dr. Megha Pundir Singh's
            </p>
            <span className="block w-10 h-px bg-white/40 mx-auto my-3" />
            <p className="text-white/70 text-[11px] sm:text-xs md:text-sm font-light tracking-[0.2em] uppercase">
              Skin, Hair &amp; Laser Clinic
            </p>
          </div>
        </motion.div>
      </section>

      {/* Zone 2: solid bar directly below the video — tagline, rating, single CTA */}
      <div className="relative z-10 w-full" style={{ background: 'var(--ink)' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 px-6 md:px-12 py-5 md:py-6"
        >
          <p className="font-serif italic text-white/90 text-sm md:text-base text-center sm:text-left">
            Confidence begins with healthy, radiant skin.
          </p>

          <div className="flex items-center gap-2">
            <span className="font-serif text-base md:text-lg text-white/90">4.9★</span>
            <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-white/50">Average Rating</span>
          </div>

          <motion.button
            onClick={() => startBooking()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-7 py-3 text-xs font-medium uppercase tracking-[0.12em] rounded-full text-white cursor-pointer shadow-md hover:opacity-90 transition-opacity duration-300"
            style={{ background: 'var(--rose)' }}
          >
            Book Appointment
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      </div>


      {/* ── DOCTOR INTRO SECTION ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-5 md:px-16" style={{ background: 'var(--white)' }} id="about">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Doctor photo — real portrait, single clean caption, subtle accent block */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            className="lg:col-span-5 relative"
          >
            <div style={{ position: 'relative', width: '100%' }}>

              {/* Decorative accent block behind photo */}
              <div
                className="hidden md:block"
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '-20px',
                  width: '100%',
                  height: '520px',
                  borderRadius: '24px',
                  background: 'var(--terracotta)',
                  opacity: 0.12,
                  zIndex: 0
                }}
              />

              {/* Main doctor photo */}
              <img
                src="/megha_pundir_singh_coat.jpg"
                alt="Dr. Megha Pundir Singh"
                style={{
                  width: '100%',
                  height: '520px',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  borderRadius: '24px',
                  display: 'block',
                  position: 'relative',
                  zIndex: 1
                }}
              />

              {/* Single caption badge — bottom left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 20px 48px rgba(0,0,0,0.15)',
                  zIndex: 2
                }}
              >
                <div style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: '4px'
                }}>
                  MBBS · MD (Skin &amp; V.D.)
                </div>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: 'var(--rose)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    background: '#4A7C59',
                    display: 'inline-block'
                  }} />
                  Certified Dermatologist · 10+ Yrs Exp.
                </div>
              </motion.div>

            </div>
          </motion.div>

          {/* Right: Text content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
            className="lg:col-span-7 space-y-6"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--rose)' }}>Meet Your Doctor</p>
              <h2 className="font-serif text-4xl md:text-[50px] font-bold leading-tight mb-3" style={{ color: 'var(--rose)' }}>
                Dr. Megha Pundir Singh, MD
              </h2>
              <p className="text-base font-medium" style={{ color: 'var(--muted)' }}>
                Dermatologist · Cosmetologist · Aesthetic Physician &amp; Hair Restoration Specialist
              </p>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Dr. Megha Pundir Singh is Varanasi's most trusted dermatologist, bringing 10+ years of clinical excellence in advanced cosmetic dermatology, medical-grade skincare, and hair restoration. She combines evidence-based medicine with a deeply personalized approach — helping every patient achieve their most confident self, safely and beautifully.
            </p>

            {/* Stats — slim inline row */}
            <div className="flex flex-wrap gap-8 py-5" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
                  <CountUp target={4.8} decimals={1} />
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>Google Rating</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
                  <CountUp target={1000} />+
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>Happy Patients</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
                  <CountUp target={10} />+
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>Years Exp.</span>
              </div>
            </div>

            {/* CTA — one primary button + two lightweight text links */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-1">
              <button
                onClick={() => startBooking()}
                className="px-8 py-3.5 text-[13px] font-semibold uppercase tracking-wider rounded-full text-white cursor-pointer transition-all hover:opacity-90 shadow-md border-0"
                style={{ background: 'var(--rose)' }}
              >
                Book a Consultation
              </button>

              <button
                onClick={() => setView('about')}
                className="group inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider border-b pb-0.5 cursor-pointer bg-transparent"
                style={{ color: 'var(--terracotta-dark)', borderColor: 'var(--border)' }}
              >
                Know More About Dr. Megha
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>

              <button
                onClick={() => setVideoModalOpen(true)}
                className="flex items-center gap-2 text-[13px] font-medium cursor-pointer bg-transparent"
                style={{ color: 'var(--muted)' }}
              >
                <span className="material-symbols-outlined text-base">play_circle</span>
                Watch Her Story
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PATIENT REVIEWS ───────────────────────────────────────────────── */}
      <section
        ref={reviewsSectionRef}
        className="relative py-20 px-5 md:px-16 overflow-hidden"
        style={{ background: 'var(--blush)' }}
        id="reviews"
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(var(--terracotta) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-12 space-y-3"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--terracotta-dark)' }}>Verified Patients</span>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: 'var(--ink)' }}>Patient Stories</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[20px]" style={{ color: 'var(--gold-accent)' }}>★</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                {/* Google Colored Logo */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-medium tracking-tight font-sans" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                  4.9 · 57+ Google Verified Reviews
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="review-card group bg-white rounded-[20px] p-7 border border-[var(--border)] transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-[0_20px_48px_rgba(184,103,79,0.12)] hover:border-[var(--terracotta)]"
              >
                {/* Subtle top accent gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--terracotta)] to-[var(--gold-accent)] transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />

                {/* Decorative Quote Mark */}
                <div
                  className="absolute top-4 right-5 font-serif text-[80px] pointer-events-none select-none text-[var(--blush)] opacity-30 transition-colors duration-300 group-hover:text-[var(--terracotta)] group-hover:opacity-10"
                  style={{ fontFamily: 'var(--font-serif)', lineHeight: 1 }}
                >
                  &ldquo;
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="rounded-full flex items-center justify-center font-bold text-sm text-white"
                      style={{
                        width: '52px',
                        height: '52px',
                        background: 'var(--terracotta)',
                        boxShadow: '0 4px 12px rgba(184,103,79,0.3)'
                      }}
                    >
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="font-serif text-[18px] font-medium leading-none" style={{ color: 'var(--ink)' }}>
                        {rev.author}
                      </h4>
                      <div className="flex gap-0.5 mt-1.5">
                        {[...Array(rev.rating)].map((_, idx) => (
                          <span key={idx} className="text-[16px] leading-none" style={{ color: 'var(--gold-accent)' }}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="font-serif italic text-[15px] leading-[1.8] mt-6" style={{ color: 'var(--ink)' }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Verified Patient Badge */}
                <div
                  className="mt-6 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] rounded-full px-3 py-1 border w-fit"
                  style={{
                    background: 'rgba(74,124,89,0.08)',
                    borderColor: 'rgba(74,124,89,0.2)',
                    color: '#4A7C59'
                  }}
                >
                  <span className="material-symbols-outlined text-[14px]" style={{ color: '#4A7C59' }}>check_circle</span>
                  Verified Patient
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="https://www.google.com/search?q=dr+megha+pundir#sv=CAESzQEKuQEStgEKd0FKaVQ0dEpCYm51djlVTWZWM0hRNXh5LUJyRFk5eFV0Zk1qb1dMcGEtaVlNZ2JtVXZyQ3NuRWxmdG1CZDFWMVpyU1FzcEIwS3dscjRPbkgxckFuTDFuU1BPVVZDVWRQdDVjOTZTX2FiTW80STRCRlVWTHJpWEdrEhdULWRFYXZxTUFabmhzZU1QX3NYUDJBYxoiQURzcjlmVFliLXBhdTZoUkxzTHJFTXFiZ01KVmxUS3EzZxIEODA1MRoBMyoAMAA4AUAAGAAgsYSEtA9KAhAC" target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold uppercase tracking-wider pb-1 transition-opacity hover:opacity-70"
              style={{ color: 'var(--terracotta-dark)', borderBottom: '1.5px solid var(--terracotta)' }}
            >
              See all reviews on Google →
            </a>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE / ABOUT ───────────────────────────────────────────── */}
      <section className="py-20 px-5 md:px-16 relative overflow-hidden" style={{ background: 'var(--white)' }}>
        {/* Subtle animated background orb */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-100px', right: '-100px',
            width: '400px', height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(184,103,79,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <motion.span
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-xs font-semibold uppercase tracking-[0.15em] block" 
                  style={{ color: 'var(--terracotta-dark)' }}
                >
                  The Derm Elixir Philosophy
                </motion.span>
                <motion.h2 
                  variants={staggerContainer}
                  initial="hidden" 
                  whileInView="show"
                  viewport={{ once: false }}
                  className="font-serif text-4xl md:text-5xl font-semibold leading-tight" 
                  style={{ color: 'var(--ink)' }}
                >
                  {"Why Patients Choose Our Clinic".split(" ").map((word, i) => (
                    <span 
                      style={{ 
                        overflow: 'hidden', 
                        display: 'inline-block',
                        marginRight: '0.25em' 
                      }} 
                      key={i}
                    >
                      <motion.span
                        variants={{
                          hidden: { y: '100%', opacity: 0 },
                          show: { 
                            y: 0, 
                            opacity: 1,
                            transition: { 
                              duration: 0.6,
                              ease: [0.22, 1, 0.36, 1] as const,
                              delay: i * 0.08 
                            } 
                          }
                        }}
                        style={{ display: 'inline-block' }}
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-sm leading-relaxed" 
                  style={{ color: 'var(--muted)' }}
                >
                  We combine rigorous medical science with the refined ambiance of a high-end wellness sanctuary. Every treatment plan is a bespoke journey toward your most confident self, led by Dr. Megha's clinical mastery and a commitment to natural-looking excellence.
                </motion.p>
              </div>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                variants={{
                  hidden: {},
                  show: {
                    transition: { staggerChildren: 0.12, delayChildren: 0.3 }
                  }
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.2 }}
              >
                {[
                  { icon: 'clinical_notes', title: 'Clinical Precision', desc: 'Evidence-based treatments using world-class medical protocols and equipment.' },
                  { icon: 'spa', title: 'Luxury Comfort', desc: 'A serene, private environment designed for relaxation and holistic healing.' },
                  { icon: 'verified_user', title: 'FDA-Approved Tech', desc: 'Only US-FDA cleared devices and certified medical-grade formulations.' },
                  { icon: 'diversity_3', title: 'Personalised Care', desc: 'Every skin is unique. Each treatment plan is tailored to your specific profile.' },
                ].map(card => (
                  <motion.div 
                    key={card.title} 
                    className="p-6 rounded-2xl border transition-all"
                    style={{ background: 'var(--cream)', borderWidth: '1px', borderColor: 'var(--border)', cursor: 'pointer' }}
                    variants={{
                      hidden: { opacity: 0, y: 40, scale: 0.96 },
                      show: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } 
                      }
                    }}
                    whileHover={{
                      y: -8,
                      boxShadow: '0 20px 48px rgba(184,103,79,0.14)',
                      borderColor: 'var(--rose)',
                      transition: { type: 'spring', stiffness: 300, damping: 20 }
                    }}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                      style={{ display: 'inline-block' }}
                    >
                      <span className="material-symbols-outlined text-2xl mb-3 block" style={{ color: 'var(--terracotta)' }}>{card.icon}</span>
                    </motion.div>
                    <h3 className="font-serif text-lg font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>{card.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{card.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center z-10">
              <div className="relative w-full max-w-lg">
                <motion.div
                  initial={{ opacity: 0, x: 80, scale: 0.95 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.02 }}
                  style={{ borderRadius: '80px', overflow: 'hidden' }}
                  className="aspect-square shadow-2xl z-20 relative"
                >
                  <img 
                    alt="HydraFacial procedure" 
                    className="w-full h-full object-cover transition-transform duration-[0.5s] ease hover:scale-[1.05]" 
                    src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80" 
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 60, x: -20 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.5,
                    type: 'spring', 
                    stiffness: 100, 
                    damping: 15 
                  }}
                  whileHover={{ scale: 1.04, rotate: 1 }}
                  style={{ borderRadius: '40px', overflow: 'hidden' }}
                  className="absolute -bottom-10 -left-10 w-2/3 aspect-[1.79] shadow-2xl z-30 border-8 border-white hidden sm:block"
                >
                  <img 
                    alt="Clinic interior" 
                    className="w-full h-full object-cover transition-transform duration-[0.5s] ease hover:scale-[1.05]" 
                    src="/clinic_interior.png" 
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TREATMENTS OVERVIEW SECTION ───────────────────────────────────── */}
      <section className="py-20 px-5 md:px-16" style={{ background: 'var(--cream)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--terracotta)' }}>
              <motion.span
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.3 }}
                className="inline-flex flex-wrap justify-center"
              >
                {"Comprehensive Dermatology Services".split(" ").map((word, idx) => (
                  <motion.span
                    key={idx}
                    style={{ display: 'inline-block', marginRight: '0.25em' }}
                    variants={staggerItem}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            </h2>
            <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
              We work with patients to develop a care plan that includes non-surgical means of enhancing and preserving their natural beauty.
            </p>
          </motion.div>

          {/* Staggered Row 1: Skin Treatments */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20">
            {/* Left: Text & Badges */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
              className="lg:col-span-6 relative pl-16 md:pl-24 py-4 order-2 lg:order-1"
            >
              {/* Vertical connector line */}
              <div className="absolute left-[32px] md:left-[48px] top-0 bottom-0 w-[1px] bg-terracotta/20" />

              {/* Circle outline badge */}
              <motion.div
                whileInView={{ scale: 1 }}
                initial={{ scale: 0 }}
                viewport={{ once: false }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="absolute left-[4px] md:left-[20px] top-4 w-[56px] h-[56px] rounded-full border-2 border-[var(--rose)] flex items-center justify-center z-10 shadow-sm animated-icon-circle"
                style={{
                  background: 'var(--blush)',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--rose)' }}>spa</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h3
                  variants={fadeUp}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-2xl md:text-3xl font-semibold"
                  style={{ color: 'var(--terracotta)' }}
                >
                  Skin Treatments
                </motion.h3>
                <motion.ul
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false, amount: 0.2 }}
                  className="space-y-4"
                >
                  {[
                    "We offer advanced and affordable skincare solutions for a breadth of medical and cosmetic skin concerns.",
                    "Some of our specialties in skin treatments include anti-aging treatments, laser skin resurfacing, cosmetic grade chemical peels, microdermabrasion, skin needling, and pigmentation removal.",
                    "We strive to improve the health, beauty, and function of our patient's skin throughout every stage of their lives."
                  ].map((bullet, idx) => (
                    <motion.li
                      key={idx}
                      variants={staggerItem}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                      style={{ color: 'var(--muted)' }}
                    >
                      <span className="material-symbols-outlined text-lg mt-0.5 flex-shrink-0" style={{ color: 'var(--terracotta)' }}>check_circle</span>
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>

            {/* Right: Full-bleed image with sharp corners */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <motion.div
                variants={fadeRight}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.2 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                style={{ borderRadius: '20px', overflow: 'hidden' }}
                className="aspect-[4/3] shadow-md"
              >
                <img
                  src="/img1.webp"
                  alt="Skin Treatments"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={e => {
                    e.currentTarget.src = 'https://www.skinlogics.in/assets/images/seviceright01.webp';
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Staggered Row 2: Hair Care Solutions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20">
            {/* Left: Image (Always Left on Desktop) */}
            <div className="lg:col-span-6 order-1">
              <motion.div
                variants={fadeLeft}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.2 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                style={{ borderRadius: '20px', overflow: 'hidden' }}
                className="aspect-[4/3] shadow-md"
              >
                <img
                  src="/img2.webp"
                  alt="Hair Care Solutions"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={e => {
                    e.currentTarget.src = 'https://www.skinlogics.in/assets/images/serviceleft02.webp';
                  }}
                />
              </motion.div>
            </div>

            {/* Right: Text & Badges (Always Right on Desktop) */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
              className="lg:col-span-6 relative pl-16 md:pl-24 py-4 order-2"
            >
              {/* Vertical connector line */}
              <div className="absolute left-[32px] md:left-[48px] top-0 bottom-0 w-[1px] bg-terracotta/20" />

              {/* Circle outline badge */}
              <motion.div
                whileInView={{ scale: 1 }}
                initial={{ scale: 0 }}
                viewport={{ once: false }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="absolute left-[4px] md:left-[20px] top-4 w-[56px] h-[56px] rounded-full border-2 border-[var(--rose)] flex items-center justify-center z-10 shadow-sm animated-icon-circle"
                style={{
                  background: 'var(--blush)',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--rose)' }}>water_drop</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h3
                  variants={fadeUp}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-2xl md:text-3xl font-semibold"
                  style={{ color: 'var(--terracotta)' }}
                >
                  Hair Care Solutions
                </motion.h3>
                <motion.ul
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false, amount: 0.2 }}
                  className="space-y-4"
                >
                  {[
                    "We appoint eminent hair care experts who provide the best, personalized hair care tips as per the patient's hair type and the best possible hair care solutions tailored to the hair-related concerns of our patients.",
                    "We offer affordable, non-surgical, FDA-approved hair growth treatments like prescription minoxidil, P-R-P, GFC, scalp microneedling, low-level laser treatment, and mesotherapy. For baldness or hair thinning, we even perform scalp micropigmentation and hair transplantation."
                  ].map((bullet, idx) => (
                    <motion.li
                      key={idx}
                      variants={staggerItem}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                      style={{ color: 'var(--muted)' }}
                    >
                      <span className="material-symbols-outlined text-lg mt-0.5 flex-shrink-0" style={{ color: 'var(--terracotta)' }}>check_circle</span>
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          </div>

          {/* Staggered Row 3: Cosmetic Dermatology Options */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-24">
            {/* Left: Text & Badges */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
              className="lg:col-span-6 relative pl-16 md:pl-24 py-4 order-2 lg:order-1"
            >
              {/* Vertical connector line */}
              <div className="absolute left-[32px] md:left-[48px] top-0 bottom-0 w-[1px] bg-terracotta/20" />

              {/* Circle outline badge */}
              <motion.div
                whileInView={{ scale: 1 }}
                initial={{ scale: 0 }}
                viewport={{ once: false }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="absolute left-[4px] md:left-[20px] top-4 w-[56px] h-[56px] rounded-full border-2 border-[var(--rose)] flex items-center justify-center z-10 shadow-sm animated-icon-circle"
                style={{
                  background: 'var(--blush)',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--rose)' }}>biotech</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h3
                  variants={fadeUp}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-2xl md:text-3xl font-semibold"
                  style={{ color: 'var(--terracotta)' }}
                >
                  Cosmetic Dermatology Options
                </motion.h3>
                <motion.ul
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false, amount: 0.2 }}
                  className="space-y-4"
                >
                  {[
                    "We have the most trusted doctors who are committed to excellence in improving skin and hair aesthetics.",
                    "Our non-exhaustive list of affordable, cosmetic dermatological options includes chemical peeling, comedone extraction, LED or laser light treatments to resurface the skin, laser hair removal, anti-wrinkle injections, dermal fillers, pigmentation removal, scar removal with subcision.",
                    "Also provide advanced skin whitening/glowing/lightening treatments, skin tightening and lifting treatments, Medi facials, and skin-booster treatment."
                  ].map((bullet, idx) => (
                    <motion.li
                      key={idx}
                      variants={staggerItem}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                      style={{ color: 'var(--muted)' }}
                    >
                      <span className="material-symbols-outlined text-lg mt-0.5 flex-shrink-0" style={{ color: 'var(--terracotta)' }}>check_circle</span>
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>

            {/* Right: Image */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <motion.div
                variants={fadeRight}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.2 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                style={{ borderRadius: '20px', overflow: 'hidden' }}
                className="aspect-[4/3] shadow-md"
              >
                <img
                  src="/img3.webp"
                  alt="Cosmetic Dermatology Options"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={e => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80';
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Follow-up block: Types of Procedures Offered table */}
          <div className="mt-20 pt-10" style={{ borderTop: '1px solid var(--border)' }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.3 }}
              className="text-center mb-12 space-y-3"
            >
              <h3 className="font-serif text-3xl md:text-4xl font-semibold uppercase tracking-wider" style={{ color: 'var(--terracotta)' }}>
                Types of Procedures Offered
              </h3>
              <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
                Derm Elixir offers various procedures. Some of the methods that are performed regularly include:
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto overflow-hidden shadow-sm border border-[var(--border)] bg-white rounded-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: 'var(--terracotta)' }}>
                      <th className="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-white w-1/2">Treatment</th>
                      <th className="py-4 px-6 text-sm font-semibold uppercase tracking-wider text-white w-1/2">Concern Addressed</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.2 }}
                    className="divide-y divide-[var(--border)]"
                  >
                    {[
                      { treatment: "Acne Treatment", concern: "Active acne, breakouts, and skin inflammation" },
                      { treatment: "Acne Scar Treatment", concern: "Deep scars, rolling scars, and uneven skin texture" },
                      { treatment: "Pigmentation & Melasma", concern: "Dark spots, sun damage, and uneven skin tone" },
                      { treatment: "Laser Hair Reduction", concern: "Unwanted body and facial hair removal" },
                      { treatment: "Hydrafacial", concern: "Clogged pores, skin dehydration, and dullness" },
                      { treatment: "Chemical Peel", concern: "Fine lines, superficial scars, and dead skin exfoliation" },
                      { treatment: "Botox & Fillers", concern: "Fine lines, wrinkles, volume loss, and facial contouring" },
                      { treatment: "PRP Hair Restoration", concern: "Hair thinning, early-stage baldness, and hair fall" },
                      { treatment: "GFC Hair Treatment", concern: "Weak hair follicles and poor hair density" }
                    ].map((row, index) => (
                      <motion.tr
                        key={index}
                        variants={staggerItem}
                        className="transition-colors hover:bg-neutral-50"
                      >
                        <td className="py-4 px-6 text-sm font-medium" style={{ color: 'var(--ink)' }}>{row.treatment}</td>
                        <td className="py-4 px-6 text-sm" style={{ color: 'var(--muted)' }}>{row.concern}</td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── ADVANCED TREATMENTS (Two-Row Marquee) ─────────────────────────────── */}
      <section className="py-20 pb-[60px]" style={{ background: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-16 mb-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>Expert Solutions</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold" style={{ color: 'var(--ink)' }}>Advanced Treatments</h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>Bespoke medical aesthetic solutions customized precisely to your skin health.</p>
          </div>
        </div>

        {/* Row 1: scrolls RTL */}
        <div
          className="overflow-hidden w-full mb-5"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
          }}
        >
          <div className="animate-marquee-rtl flex gap-5">
            {[...row1Cards, ...row1Cards].map((card, i) => (
              <div
                key={`r1-${i}`}
                onClick={() => startBooking(card.name)}
                className="flex-shrink-0 w-[240px] flex flex-col cursor-pointer transition-all duration-300"
                style={{
                  background: 'var(--white)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = '0 20px 48px rgba(184,103,79,0.15)';
                  el.style.borderColor = 'var(--terracotta)';
                  const img = el.querySelector('.card-img') as HTMLImageElement | null;
                  if (img) img.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                  el.style.borderColor = 'var(--border)';
                  const img = el.querySelector('.card-img') as HTMLImageElement | null;
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                {/* Image */}
                <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={card.image}
                    alt={card.name}
                    className="card-img w-full h-full object-cover"
                    style={{ transition: 'transform 0.5s ease' }}
                  />
                </div>
                {/* Body */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <h3 className="font-serif text-[15px] font-medium leading-[1.3]" style={{ color: 'var(--ink)' }}>
                    {card.name}
                  </h3>
                  <div className="mt-4">
                    <span
                      className="text-xs font-normal hover:underline animate-fade-in"
                      style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
                    >
                      Book Now →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: scrolls LTR */}
        <div
          className="overflow-hidden w-full mb-5"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
          }}
        >
          <div className="animate-marquee-ltr flex gap-5">
            {[...row2Cards, ...row2Cards].map((card, i) => (
              <div
                key={`r2-${i}`}
                onClick={() => startBooking(card.name)}
                className="flex-shrink-0 w-[240px] flex flex-col cursor-pointer transition-all duration-300"
                style={{
                  background: 'var(--white)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = '0 20px 48px rgba(184,103,79,0.15)';
                  el.style.borderColor = 'var(--terracotta)';
                  const img = el.querySelector('.card-img') as HTMLImageElement | null;
                  if (img) img.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                  el.style.borderColor = 'var(--border)';
                  const img = el.querySelector('.card-img') as HTMLImageElement | null;
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                {/* Image */}
                <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={card.image}
                    alt={card.name}
                    className="card-img w-full h-full object-cover"
                    style={{ transition: 'transform 0.5s ease' }}
                  />
                </div>
                {/* Body */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <h3 className="font-serif text-[15px] font-medium leading-[1.3]" style={{ color: 'var(--ink)' }}>
                    {card.name}
                  </h3>
                  <div className="mt-4">
                    <span
                      className="text-xs font-normal hover:underline animate-fade-in"
                      style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
                    >
                      Book Now →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 md:px-16" style={{ background: 'var(--white)' }} id="gallery">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>The Workspace</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold" style={{ color: 'var(--ink)' }}>Clinic Gallery</h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>A serene, medically-equipped environment designed for your comfort and confidence.</p>
          </div>
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {(galleryItems && galleryItems.length > 0
              ? galleryItems.slice(0, 3)
              : [
                  { url: "/img2.webp", title: "Dr. Megha in clinic chair" },
                  { url: "/clinic_interior.png", title: "Clinic reception" },
                  { url: "/hydrafacial_procedure.png", title: "Treatment room with laser equipment" }
                ]
            ).map((photo: any, idx) => (
              <motion.div
                key={photo._id || idx}
                variants={{
                  hidden: { scale: 0.95, opacity: 0 },
                  show: {
                    scale: 1,
                    opacity: 1,
                    transition: {
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1] as const
                    }
                  }
                }}
                onClick={() => setView('gallery')}
                className="relative overflow-hidden rounded-2xl group cursor-pointer shadow-md"
                style={{ height: '320px' }}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-[0.4s] group-hover:scale-[1.04]"
                />
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
                  style={{ background: 'rgba(42,33,24,0.5)' }}
                >
                  <span className="text-white text-xs font-medium uppercase tracking-[0.15em] font-sans">
                    VIEW GALLERY
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => setView('gallery')}
              className="border-[1.5px] border-[var(--rose)] text-[var(--rose)] bg-transparent rounded-full px-9 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 hover:bg-[var(--rose)] hover:text-white cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              VIEW FULL GALLERY →
            </button>
          </div>
        </div>
      </section>

      {/* ── BEFORE & AFTER ───────────────────────────────────────────────── */}
      <section className="py-20 px-5 md:px-16" style={{ background: 'var(--white)' }} id="transformations">
        <div className="max-w-7xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: false }} 
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--terracotta)' }}>Real Patients</span>
            <h2 className="font-serif text-4xl md:text-[44px] font-semibold" style={{ color: 'var(--ink)' }}>Real Results, Real Confidence</h2>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>
              Verified patient skin progression records
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            {(photoTestimonials.length > 0 ? photoTestimonials : fallbackPhotoTestimonials)
              .slice(0, 3)
              .map((item, idx) => (
                <motion.div
                  key={item._id}
                  variants={cardVariants}
                  whileHover={{
                    y: -10,
                    transition: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                  className="bg-white rounded-[24px] overflow-hidden shadow-sm flex flex-col transition-all duration-300 hover:shadow-md card-hover-shadow-rose"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {/* Before/After Split Container */}
                  <div className="grid grid-cols-2 aspect-square relative bg-stone-100 overflow-hidden">
                    <div className="relative h-full w-full border-r" style={{ borderColor: 'var(--border)' }}>
                      <img src={getMediaUrl(item.beforeUrl)} alt={`${item.title} Before`} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
                        Before
                      </div>
                    </div>
                    <div className="relative h-full w-full">
                      <img src={getMediaUrl(item.afterUrl)} alt={`${item.title} After`} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-emerald-700/80 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
                        After
                      </div>
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>
                        {item.treatment}
                      </span>
                      <h3 className="font-serif text-lg font-semibold mt-1 leading-snug" style={{ color: 'var(--ink)' }}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--muted)' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setView('testimonials');
              }}
              className="border-[1.5px] border-[var(--rose)] text-[var(--rose)] bg-transparent rounded-full px-9 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 hover:bg-[var(--rose)] hover:text-white cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              SEE MORE TRANSFORMATIONS →
            </button>
          </div>
        </div>
      </section>

      {/* ── VIDEO TESTIMONIALS PREVIEW SECTION ──────────────────────────────── */}
      <section className="py-20 overflow-hidden" style={{ background: 'var(--blush)' }} id="insights">
        <div className="max-w-7xl mx-auto px-5 md:px-16 mb-12 text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="font-serif text-4xl md:text-5xl font-semibold"
            style={{ color: 'var(--ink)' }}
          >
            Video Testimonial
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.15
            }}
            className="text-sm max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            Listen to our happy patients sharing their real treatment journeys and transformations.
          </motion.p>
        </div>

        <motion.div
          className="max-w-8xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 justify-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {videoTestimonials.slice(0, 3).map((item, index) => {
            const getYouTubeId = (url: string) => {
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
              const match = url.match(regExp);
              return match && match[2].length === 11 ? match[2] : null;
            };

            const youtubeId = getYouTubeId(item.youtubeUrl);
            const isPlaying = playingVideoId === item._id;

            const getTitle = (idx: number) => {
              if (idx === 0) return "Patient Testimonial — Hair Loss";
              if (idx === 1) return "Dr. Megha's Skin Glow Tips";
              return "Skincare Product Guide by Dr. Megha";
            };

            return (
              <motion.div
                key={item._id}
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }
                }}
                className="bg-white p-4 rounded-[24px] shadow-sm flex flex-col transition-all duration-300 hover:shadow-md card-hover-shadow-rose"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="aspect-video relative bg-black overflow-hidden rounded-xl">
                  {isPlaying && youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                      title={item.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div
                      className="absolute inset-0 cursor-pointer group"
                      onClick={() => setPlayingVideoId(item._id || null)}
                    >
                      <img
                        alt={item.title}
                        className="w-full h-full object-cover thumbnail-zoom"
                        src={youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : ''}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                        <motion.div
                          className="play-button"
                          animate={{
                            scale: [1, 1.12, 1],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            repeatDelay: 1.5,
                            ease: "easeInOut"
                          }}
                          whileHover={{ scale: 1.2 }}
                        >
                          <svg className="w-16 h-12 drop-shadow-md" viewBox="0 0 68 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79 0 34 0 34 0S12.21 0 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C0 13.06 0 24 0 24s0 10.94 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 48 34 48 34 48s21.79 0 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C68 34.94 68 24 68 24s0-10.94-1.48-16.26z" fill="#FF0000" />
                            <path d="M45 24L27 14v20l18-10z" fill="#FFFFFF" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center" style={{ padding: '12px 0' }}>
                  <h3 className="font-serif text-[16px]" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                    {getTitle(index)}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* See More Button */}
        <div className="text-center mt-12">
          <motion.button
            onClick={() => setView('testimonials')}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{
              scale: 1.05,
              transition: { type: 'spring', stiffness: 300 }
            }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-full text-white transition-all cursor-pointer shadow-md"
            style={{ background: 'var(--terracotta)' }}
          >
            See More
          </motion.button>
        </div>
      </section>

      {/* ── NEWS & BLOG ──────────────────────────────────────────────────── */}
      <section className="py-20 px-5 md:px-16" style={{ background: 'var(--cream)' }} id="blog">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="font-sans text-[11px] uppercase tracking-[0.15em] font-medium" style={{ color: 'var(--rose)' }}>CLINICAL INSIGHTS</div>
            <h2 className="font-serif font-bold" style={{ color: 'var(--ink)', fontSize: '48px', lineHeight: '1.2' }}>News &amp; Blog</h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
              Explore insightful articles and expert advice on achieving radiant, healthy skin.
            </p>
          </div>

          <div ref={blogSectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post, i) => (
              <div
                key={post._id}
                className="blog-card flex flex-col"
                onClick={() => setView('blog-detail', post.slug)}
              >
                <div className="blog-card-img-container">
                  <img
                    src={getMediaUrl(post.image)}
                    alt={post.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80';
                    }}
                  />
                  <div className="blog-date-badge">
                    <span className="blog-date-number">{post.dateString.split(' ')[0]}</span>
                    <span className="blog-date-month">{post.dateString.split(' ')[1]}</span>
                  </div>
                  <div className="blog-card-gradient"></div>
                </div>

                <div className="blog-card-body flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {post.category.split(',').map((cat, idx) => (
                        <span key={idx} className="blog-tag">
                          {cat.trim()}
                        </span>
                      ))}
                    </div>
                    <h3 className="blog-title">{post.title}</h3>
                    <p className="blog-excerpt">{post.summary}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setView('blog-detail', post.slug);
                    }}
                    className="blog-read-button"
                  >
                    Read Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOLLOW ON INSTAGRAM ───────────────────────────────────────────── */}
      <InstagramSection />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 md:px-16" style={{ background: 'var(--white)' }} id="faq">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>Patient Inquiries</span>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: 'var(--ink)' }}>Common Questions</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Curated answers representing treatment guidelines, consult pricing, and clinic safety.</p>
          </div>

          <div className="space-y-0">
            {[
              { q: 'What is the consultation fee?', a: 'The initial comprehensive skin and hair consultation fee with Dr. Megha is ₹500. This includes diagnostics, scalp/skin mapping, and a bespoke treatment roadmap.' },
              { q: 'Are laser treatments safe for sensitive skin?', a: 'Yes, we use US-FDA approved laser technologies calibrated precisely. Dr. Megha performs skin analysis and patch tests to guarantee optimal safety with any procedure.' },
              { q: 'How long does active acne treatment take?', a: 'Visible improvements are usually seen within 2-4 weeks. A full clinical regimen spanning acne peels, medication, and skin rejuvenation typically lasts 3 to 6 months depending on individual severity.' },
              { q: 'Do you offer hair fall and thinning treatments?', a: 'We provide specialized clinical hair loss treatments including PRP (Platelet Rich Plasma) therapy, clinical Mesotherapy, and personalized hair growth diagnostics.' }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="overflow-hidden"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center py-5 text-left transition-colors cursor-pointer"
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="font-serif text-lg font-medium" style={{ color: 'var(--ink)' }}>{faq.q}</span>
                  <span
                    className="material-symbols-outlined flex-shrink-0 ml-4 transition-transform duration-300"
                    style={{ color: 'var(--terracotta)', transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT + MAP ────────────────────────────────────────────────── */}
      <section className="py-20 px-5 md:px-16" style={{ background: 'var(--cream)' }} id="contact">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2">
            {/* Left panel */}
            <div
              className="p-10 md:p-14 flex flex-col justify-between space-y-10"
              style={{ background: 'var(--terracotta-dark)' }}
            >
              <div className="space-y-7">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-3">Visit Our Clinic</span>
                  <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white leading-tight">
                    Gyandeep Medicare Hospital
                  </h2>
                </div>

                <div className="space-y-5 text-white/90">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <span className="material-symbols-outlined text-lg text-white">location_on</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Address</p>
                      <p className="text-sm font-medium leading-relaxed">Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi, Uttar Pradesh 221010</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <span className="material-symbols-outlined text-lg text-white">call</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Phone Helpline</p>
                      <p className="text-sm font-medium">+91 9453238699</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <span className="material-symbols-outlined text-lg text-white">schedule</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Clinic Hours</p>
                      <p className="text-sm font-medium">Mon – Sat: 10:00 AM – 08:00 PM<br />Sunday: Closed (By Appointment)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a href="tel:+919453238699"
                  className="py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-center cursor-pointer"
                  style={{ background: 'var(--white)', color: 'var(--terracotta-dark)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--white)')}
                >
                  <span className="material-symbols-outlined text-sm">call</span> Call Now
                </a>
                <a href="https://api.whatsapp.com/send/?phone=917905587609&text=Hello%21+I+would+like+to+discuss+a+clinical+treatment+with+Dr.+Megha+Pundir+Singh.&type=phone_number&app_absent=0"
                  target="_blank" rel="noreferrer"
                  className="py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-center cursor-pointer text-white"
                  style={{ background: 'var(--gold-accent)' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <span className="material-symbols-outlined text-sm">chat</span> WhatsApp
                </a>
                <a href="https://maps.app.goo.gl/358y8bHkW6yUjE8u9" target="_blank" rel="noreferrer"
                  className="py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-center cursor-pointer text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="material-symbols-outlined text-sm">near_me</span> Directions
                </a>
              </div>
            </div>

            {/* Right: Map */}
            <div className="min-h-[400px] lg:min-h-full overflow-hidden relative">
              <iframe
                title="Dermelixir Location Map"
                allowFullScreen={true}
                className="w-full h-full border-0 min-h-[400px] lg:absolute"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.729792078696!2d83.0044547!3d25.2798418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2de26f74f767%3A0xc3f8373b9e4a3075!2sSamne%20Ghat%2C%20Lanka%2C%20Varanasi%2C%20Uttar%20Pradesh%20221005!5e0!3m2!1sen!2sin!4v1715678901234!5m2!1sen!2sin"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="pt-16 pb-28 px-5 text-center flex flex-col items-center space-y-8" style={{ background: 'var(--ink)' }}>
        <button onClick={() => setView('landing')} className="cursor-pointer">
          <span className="font-serif text-3xl font-semibold text-white tracking-tight">Derm Elixir</span>
        </button>
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-medium uppercase tracking-widest">
          {[
            { label: 'Philosophy', href: '#about' },
            { label: 'Treatments', href: '#treatments' },
            { label: 'Gallery', href: '#gallery' },
            { label: 'Reviews', href: '#reviews' },
            { label: 'Contact', href: '#contact' },
          ].map(link => (
            <a key={link.label} href={link.href}
              className="transition-colors hover:opacity-100"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F5E4D8')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >{link.label}</a>
          ))}
          <button
            onClick={() => setView('patient-portal')}
            className="transition-colors hover:opacity-100 cursor-pointer text-xs font-medium uppercase tracking-widest"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F5E4D8')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >Patient Portal</button>
        </nav>

        <div className="flex gap-3">
          {[
            { href: 'https://instagram.com', icon: 'photo_camera' },
            { href: 'https://youtube.com', icon: 'smart_display' },
            { href: 'https://facebook.com', icon: 'share' },
          ].map(social => (
            <a key={social.icon} href={social.href} target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ border: '1px solid rgba(122,110,98,0.5)', color: 'var(--muted)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-accent)'; e.currentTarget.style.color = 'var(--gold-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(122,110,98,0.5)'; e.currentTarget.style.color = 'var(--muted)'; }}
            >
              <span className="material-symbols-outlined text-base">{social.icon}</span>
            </a>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-[0.2em] leading-relaxed max-w-lg" style={{ color: 'rgba(122,110,98,0.6)' }}>
          &copy; 2026 Derm Elixir by Dr. Megha Pundir Singh. All Rights Reserved.
        </p>
      </footer>

      {/* ── MOBILE STICKY BAR ────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden" style={{ background: 'rgba(255,249,240,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-3 max-w-md mx-auto">
          <a
            href="https://api.whatsapp.com/send/?phone=917905587609&text=Hello%21+I+would+like+to+book+a+consultation+with+Dr.+Megha+Pundir+Singh.&type=phone_number&app_absent=0"
            target="_blank" rel="noreferrer"
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold tracking-widest text-xs uppercase active:scale-95 transition-all text-center text-white"
            style={{ background: '#25D366' }}
          >
            <span className="material-symbols-outlined text-base">chat</span> WhatsApp
          </a>
          <button
            onClick={() => startBooking()}
            className="flex-[1.5] h-12 rounded-xl flex items-center justify-center gap-2 font-bold tracking-widest text-xs uppercase active:scale-95 transition-all text-white cursor-pointer"
            style={{ background: 'var(--terracotta)' }}
          >
            <span className="material-symbols-outlined text-base">calendar_month</span> Book Now
          </button>
        </div>
      </div>

      {/* ── DOCTOR VIDEO MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {videoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
            style={{ background: 'rgba(42,33,24,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow cursor-pointer"
                style={{ color: 'var(--ink)' }}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <div className="aspect-video">
                <iframe
                  width="100%" height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Dr. Megha Pundir Singh — Derm Elixir"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
