import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AnimatedCounter } from './AnimatedCounter';
import { REVIEWS, TREATMENTS } from '../initialData';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export const LandingView: React.FC = () => {
  const { 
    setView, 
    setSelectedTreatmentForBooking, 
    galleryItems, 
    reels,
    loginPatientWithGoogle,
    patientToken,
    currentPatient,
    blogs
  } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Global Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-on-surface/5 h-16 transition-expo">
        <div className="flex justify-between items-center px-5 h-full w-full max-w-7xl mx-auto md:px-16">
          <div className="flex items-center gap-4">
            <span className="font-serif text-2xl font-bold tracking-tighter text-primary">DERMELIXIR</span>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#about" className="text-on-surface-variant/70 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">ABOUT</a>
            <a href="#treatments" className="text-on-surface-variant/70 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">TREATMENTS</a>
            <button onClick={() => setView('skin-analyzer')} className="text-on-surface-variant/70 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer">AI SKIN SCAN</button>
            <a href="#gallery" className="text-on-surface-variant/70 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">GALLERY</a>
            <a href="#blog" className="text-on-surface-variant/70 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">BLOG</a>
            <a href="#reviews" className="text-on-surface-variant/70 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">REVIEWS</a>
            <a href="#contact" className="text-on-surface-variant/70 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">CONTACT</a>
          </nav>

          <div className="flex items-center gap-4">
            {patientToken && currentPatient ? (
              <>
                <button
                  onClick={() => setView('patient-portal')}
                  className="flex items-center gap-2 border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-on-primary px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-full cursor-pointer"
                >
                  DashBoard 🚀
                </button>
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs shadow-md uppercase">
                  {currentPatient.name ? currentPatient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : currentPatient.email.slice(0, 2)}
                </div>
              </>
            ) : (
              <button
                onClick={handleGoogleLoginClick}
                className="border border-on-surface-variant/30 text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                LOGIN
              </button>
            )}
            <button
              onClick={() => startBooking()}
              className="bg-primary text-on-primary px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-on-surface-variant transition-all active:scale-95 ease-in-out duration-300"
            >
              BOOK NOW
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 px-5 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center position-relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col items-start space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Leading Dermatologist in Varanasi
              </span>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight text-primary font-bold">
                Dr. Megha Pundir Singh
              </h1>
              <p className="font-serif text-xl sm:text-2xl text-on-surface-variant/80 max-w-xl italic">
                Dermatologist | Hair Specialist | Laser Expert. Advanced Skin, Hair &amp; Laser Treatments.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-y border-outline-variant/30 py-6 w-full max-w-2xl">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold text-lg">
                    <AnimatedCounter value={4.9} decimals={1} /> Rating
                  </span>
                </div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Google Reviews</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-outline-variant/30 pl-4 md:pl-6">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary">group</span>
                  <span className="font-bold text-lg">
                    <AnimatedCounter value={1000} suffix="+" />
                  </span>
                </div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Happy Patients</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-outline-variant/30 pl-4 md:pl-6">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary">history_edu</span>
                  <span className="font-bold text-lg">
                    <AnimatedCounter value={10} suffix="+" /> Years
                  </span>
                </div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Experience</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="space-y-3 w-full">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={() => startBooking()}
                  className="bg-primary text-on-primary px-8 py-4 text-xs font-bold uppercase tracking-widest hover:opacity-85 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">calendar_month</span>
                  Book Appointment
                </button>
                <button
                  onClick={() => setView('skin-analyzer')}
                  className="bg-emerald-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-950 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">spa</span>
                  AI Skin Analyzer
                </button>
                <a
                  href="https://api.whatsapp.com/send/?phone=917905587609&text=Hello%21+I+would+like+to+discuss+a+clinical+treatment+with+XELIX+Clinical+Concierge.&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noreferrer"
                  className="border border-outline text-on-surface px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  WhatsApp Chat
                </a>
              </div>
              <p className="text-on-surface-variant/70 text-xs italic">
                Book your personalized consult instantly inside the app.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative mt-8 lg:mt-0"
          >
            <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl relative z-10 border-[12px] border-surface-container-lowest bg-white">
              <img
                alt="Dr. Megha Pundir - XELIX"
                className="w-full h-full object-contain p-4"
                src="/meghna_Ai.jpg"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-container/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </motion.div>
        </div>
      </section>

      {/* Patient Reviews Section */}
      <section className="py-20 bg-surface-container-low px-5 md:px-16" id="reviews">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30">
            <div className="space-y-3">
              <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">Verified Patients</span>
              <h2 className="font-serif text-3xl md:text-4xl text-primary font-bold">Patient Stories</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center text-secondary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <span className="font-bold text-sm">4.9 Skin Clinic Rating</span>
                <span className="text-on-surface-variant/40">|</span>
                <span className="text-on-surface-variant text-sm">57+ Google Verified Reviews</span>
              </div>
            </div>
            <a
              href="https://search.google.com/local/reviews"
              target="_blank"
              rel="noreferrer"
              className="text-primary font-bold text-xs uppercase tracking-widest border-b-2 border-primary pb-1 hover:opacity-70 transition-opacity"
            >
              See what our patients say
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={rev.id}
                className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary font-sans">
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-background">{rev.author}</h4>
                      <div className="flex text-secondary scale-75 -ml-3 mt-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-sm italic leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-[10px] text-secondary font-bold tracking-widest uppercase">
                  <span className="material-symbols-outlined text-[14px]">shield</span> Verifed Clinic Patient
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose / About Section */}
      <section className="py-24 bg-surface-container-lowest px-5 md:px-16" id="about">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <span className="text-secondary text-xs uppercase tracking-[0.2em] font-bold">The Dermelixir Philosophy</span>
                <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                  Why Patients Choose Our Clinic
                </h2>
                <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                  We combine rigorous medical science with the refined ambiance of a high-end wellness sanctuary. Every treatment plan is a bespoke journey toward your most confident self, led by Dr. Megha's clinical mastery and a commitment to natural-looking excellence.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-surface rounded-2xl border border-outline-variant/30 hover:shadow-xl transition-all duration-300">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-3">clinical_notes</span>
                  <h3 className="font-serif text-xl font-bold mb-2">Clinical Precision</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed">Evidence-based treatments using world-class medical protocols and equipment.</p>
                </div>
                <div className="p-6 bg-surface rounded-2xl border border-outline-variant/30 hover:shadow-xl transition-all duration-300">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-3">spa</span>
                  <h3 className="font-serif text-xl font-bold mb-2">Luxury Comfort</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed">A serene, private environment designed for relaxation and holistic healing.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                <div className="aspect-square rounded-[80px] overflow-hidden shadow-2xl z-20 relative">
                  <img
                    alt="HydraFacial procedure"
                    className="w-full h-full object-cover"
                    src="/hydrafacial_procedure.png"
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 w-2/3 aspect-[1.79] rounded-[40px] overflow-hidden shadow-2xl z-30 border-8 border-surface-container-lowest hidden sm:block">
                  <img
                    alt="Clinic interior"
                    className="w-full h-full object-cover"
                    src="/clinic_interior.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Treatments Section */}
      <section className="py-20 bg-surface px-5 md:px-16" id="treatments">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">Expert Solutions</span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold">Advanced Treatments</h2>
            <p className="text-sm text-on-surface-variant max-w-xl mx-auto">Bespoke medical aesthetic solutions customized precisely to your skin health.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TREATMENTS.map((treatment) => (
              <div
                key={treatment.id}
                className="group bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/30 hover:border-secondary transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="material-symbols-outlined text-2xl">{treatment.icon}</span>
                  </div>
                  <h3 className="font-serif text-2xl mb-3 font-semibold text-primary">{treatment.name}</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed mb-6">{treatment.description}</p>
                </div>
                <div>
                  <ul className="space-y-2 mb-6 text-on-surface-variant text-xs">
                    {treatment.subservices.map((sub, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-xs">check_circle</span>
                        {sub}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => startBooking(treatment.name)}
                    className="w-full bg-surface-container hover:bg-neutral-900 hover:text-white border border-outline-variant/50 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                  >
                    BOOK TREATMENT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-5 md:px-16 bg-surface-container-low" id="gallery">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">The Workspace</span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold">Clinic Gallery</h2>
            <p className="text-sm text-on-surface-variant max-w-xl mx-auto">Experience the intersection of high-luxury and pristine diagnostic clinical excellence.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item._id}
                className="relative rounded-[24px] overflow-hidden group aspect-[4/3] shadow-md border border-outline-variant/20"
              >
                <img
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  src={item.url}
                />
                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white font-bold text-xs uppercase tracking-widest">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Transformations Slider */}
      <section className="py-20 bg-surface-container-lowest border-t border-on-surface/5" id="transformations">
        <BeforeAfterSlider />
      </section>

      {/* Insights Reels Section */}
      <section className="py-20 bg-surface overflow-hidden" id="insights">
        <div className="max-w-7xl mx-auto px-5 md:px-16 mb-12 space-y-12">
          <div className="space-y-4">
            <span className="text-secondary text-xs uppercase tracking-[0.3em] font-bold">Clinical Knowledge Hub</span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold">Treatment Videos & Insights</h2>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Unlock your best skin and hair with expert skin hair and body tips from Dr. Megha Singh, shared via high-resolution clinical briefing videos.
            </p>
          </div>

          {/* Type Filters - Oliva Style */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-none px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border ${selectedCategory === cat
                  ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20'
                  : 'bg-white text-on-surface-variant border-outline-variant/30 hover:border-secondary'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {reels
            .filter(r => selectedCategory === 'All' || r.title.toLowerCase().includes(selectedCategory.toLowerCase()))
            .map((reel) => {
              const isPlaying = playingVideoId === reel._id;
              const embedUrl = reel.videoUrl?.includes('youtube.com')
                ? reel.videoUrl.replace('youtube.com/shorts/', 'youtube.com/embed/').split('?')[0] + `?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${reel.videoUrl.split('shorts/')[1]?.split('?')[0]}`
                : reel.videoUrl?.includes('instagram.com')
                  ? `${reel.videoUrl.split('/?')[0].replace(/\/$/, '')}/embed`
                  : reel.videoUrl;

              return (
                <motion.div
                  key={reel._id}
                  className="bg-white rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-outline-variant/10 group flex flex-col transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)]"
                >
                  {/* Video Area - 9:16 for Reels */}
                  <div className="aspect-[9/16] relative bg-neutral-900 overflow-hidden">
                    {isPlaying ? (
                      <div className="absolute inset-0 w-full h-full">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={reel.title}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted(!isMuted);
                          }}
                          className="absolute bottom-6 right-6 z-10 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-2xl"
                        >
                          <span className="material-symbols-outlined text-xl">
                            {isMuted ? 'volume_off' : 'volume_up'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleTogglePlay(reel._id)}
                        className="absolute inset-0 cursor-pointer group"
                      >
                        <img
                          alt={reel.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          src={reel.coverImage}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(238,42,123,0.4)] group-hover:scale-110 transition-transform duration-500 border-2 border-white/50">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-8 h-8"
                            >
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                              <path d="m9 8 6 4-6 4Z" fill="currentColor" />
                              <path d="M2 12h20" />
                              <path d="M7 2v4" />
                              <path d="M17 2v4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title Area */}
                  <div
                    onClick={() => !isPlaying && handleTogglePlay(reel._id)}
                    className="p-8 flex-1 flex flex-col justify-start cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <h4 className="font-serif text-xl md:text-2xl font-bold text-primary leading-tight group-hover:text-secondary transition-colors mb-2">
                      {reel.title}
                    </h4>
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-on-surface-variant/40">Clinical Briefing</p>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </section>

      {/* News & Blog Section */}
      <section className="py-20 bg-surface px-5 md:px-16" id="blog">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold text-center">News & Blog</h2>
            <p className="text-sm text-on-surface-variant/70 text-center max-w-2xl mx-auto font-medium">
              Explore our insightful articles and expert advice on achieving radiant and healthy skin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                key={post._id}
                className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    {/* Floating Date Badge */}
                    <div
                      className="absolute bottom-0 left-0 bg-[#C4846A] text-white py-3 px-4 flex flex-col items-center justify-center font-sans"
                      style={{ borderTopRightRadius: '16px' }}
                    >
                      <span className="text-lg font-black leading-none">{post.dateString.split(' ')[0]}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-1">{post.dateString.split(' ')[1]}</span>
                    </div>
                  </div>

                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-6 text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">folder</span>
                        <span>{post.category}</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-primary leading-snug hover:text-[#C4846A] transition-colors cursor-pointer" onClick={() => setView('blog-detail', post.slug)}>
                      {post.title}
                    </h3>

                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <button
                    onClick={() => setView('blog-detail', post.slug)}
                    className="w-full bg-[#C4846A]/80 hover:bg-[#C4846A] text-white py-3.5 px-6 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors duration-150 cursor-pointer shadow-sm"
                  >
                    Read Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-20 bg-surface-container-low px-5 md:px-16" id="faq">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[10px] text-secondary font-bold tracking-widest uppercase text-center w-full block">Patient Inquiries</span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-bold text-center">Common Questions</h2>
            <p className="text-xs text-on-surface-variant text-center">Curated answers representing treatment guidelines, consult pricing, and clinic safety.</p>
          </div>

          <div className="space-y-3">
            {[
              { q: 'What is the consultation fee?', a: 'The initial comprehensive skin and hair consultation fee with Dr. Megha is ₹500. This includes diagnostics, scalp/skin mapping, and a bespoke treatment roadmap.' },
              { q: 'Are laser treatments safe for sensitive skin?', a: 'Yes, we use US-FDA approved laser technologies calibrated precisely. Dr. Megha performs skin analysis and patch tests to guarantee optimal safety with any procedure.' },
              { q: 'How long does active acne treatment take?', a: 'Visible improvements are usually seen within 2-4 weeks. A full clinical regimen spanning acne peels, medication, and skin rejuvenation typically lasts 3 to 6 months depending on individual severity.' },
              { q: 'Do you offer hair fall and thinning treatments?', a: 'We provide specialized clinical hair loss treatments including PRP (Platelet Rich Plasma) therapy, clinical Mesotherapy, and personalized hair growth diagnostics.' }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-outline-variant/30 rounded-2xl bg-surface-container-lowest overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left hover:bg-surface-container-low transition-colors duration-150"
                >
                  <span className="font-bold text-sm text-primary">{faq.q}</span>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-surface-container/10"
                    >
                      <p className="px-6 pb-5 text-on-surface-variant text-xs leading-relaxed border-t border-outline-variant/10 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Appointment Contact Row */}
      <section className="py-20 px-5 md:px-16 bg-surface-container-lowest border-t border-outline-variant/20" id="contact">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary text-on-primary rounded-[40px] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-between space-y-10">
                <div className="space-y-6">
                  <span className="font-serif text-xs text-secondary-fixed tracking-widest uppercase font-bold">Visit Our Clinic</span>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                    Gyandeep Medicare Hospital
                  </h2>

                  <div className="space-y-6 text-sm text-white/90">
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-secondary-fixed bg-white/10 p-2.5 rounded-full">location_on</span>
                      <div>
                        <h4 className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">Address</h4>
                        <p className="text-base font-medium">Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi, Uttar Pradesh 221010</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-secondary-fixed bg-white/10 p-2.5 rounded-full">call</span>
                      <div>
                        <h4 className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">Phone Helpline</h4>
                        <p className="text-base font-medium">+91 9453238699</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-secondary-fixed bg-white/10 p-2.5 rounded-full">schedule</span>
                      <div>
                        <h4 className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">Clinic Consulting Hours</h4>
                        <p className="text-base font-medium">Mon - Sat: 10:00 AM - 08:00 PM<br />Sunday: Closed (By Prior Appointment)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
                  <a
                    href="tel:+917905587609"
                    className="bg-white text-primary py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors text-center"
                  >
                    <span className="material-symbols-outlined text-sm">call</span> CALL NOW
                  </a>
                  <a
                    href="https://api.whatsapp.com/send/?phone=917905587609&text=Hello%21+I+would+like+to+discuss+a+clinical+treatment+with+XELIX+Clinical+Concierge.&type=phone_number&app_absent=0"
                    target="_blank"
                    className="bg-secondary-container text-on-secondary-container py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary transition-colors hover:text-white text-center"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span> WHATSAPP
                  </a>
                  <a
                    href="https://maps.app.goo.gl/358y8bHkW6yUjE8u9"
                    target="_blank"
                    className="bg-transparent border border-white/20 text-white py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-center"
                  >
                    <span className="material-symbols-outlined text-sm">near_me</span> DIRECTIONS
                  </a>
                </div>
              </div>

              {/* High resolution interactive Map container */}
              <div className="min-h-[400px] lg:min-h-full overflow-hidden bg-neutral-900 relative">
                <iframe
                  title="Dermelixir Location Map samne ghat varanasi"
                  allowFullScreen={true}
                  className="w-full h-full border-0 grayscale saturate-50 hover:grayscale-0 transition-all duration-1000 min-h-[400px] lg:absolute"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.729792078696!2d83.0044547!3d25.2798418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2de26f74f767%3A0xc3f8373b9e4a3075!2sSamne%20Ghat%2C%20Lanka%2C%20Varanasi%2C%20Uttar%20Pradesh%20221005!5e0!3m2!1sen!2sin!4v1715678901234!5m2!1sen!2sin"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Overlay Modal */}
      <AnimatePresence>
        {false && (
          <div />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full pt-20 pb-32 bg-surface-container-lowest border-t border-outline-variant/30 text-center px-5 flex flex-col items-center space-y-10">
        <span className="font-serif text-3xl font-bold text-primary tracking-tighter">DERMELIXIR</span>
        <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-xs font-bold uppercase tracking-widest">
          <a href="#about" className="text-on-surface-variant/70 hover:text-primary transition-opacity">Philosophy</a>
          <a href="#treatments" className="text-on-surface-variant/70 hover:text-primary transition-opacity">Treatments</a>
          <button onClick={() => setView('patient-portal')} className="text-on-surface-variant/70 hover:text-primary transition-opacity uppercase cursor-pointer font-bold tracking-widest text-xs">Patient Portal</button>
          <a href="#gallery" className="text-on-surface-variant/70 hover:text-primary transition-opacity">Gallery</a>
          <a href="#reviews" className="text-on-surface-variant/70 hover:text-primary transition-opacity">Reviews</a>
          <a href="#contact" className="text-on-surface-variant/70 hover:text-primary transition-opacity">Directions Map</a>
        </nav>
        <div className="flex gap-4">
          <a href="#" className="w-12 h-12 rounded-full border border-outline-variant/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-lg">share</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-outline-variant/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-lg">photo_camera</span>
          </a>
        </div>
        <p className="text-on-surface-variant/50 text-[10px] tracking-[0.25em] uppercase leading-relaxed max-w-lg">
          &copy; 2026 DERMELIXIR BY DR. MEGHA PUNDIR SINGH. POWERED BY DERMELIXIR SYSTEMS. ALL RIGHTS RESERVED.
        </p>
      </footer>

      {/* Sticky Bottom Actions (On Mobile viewports) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-outline-variant/20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 lg:hidden">
        <div className="flex gap-3 max-w-md mx-auto">
          <a
            href="https://api.whatsapp.com/send/?phone=917905587609&text=Hello%21+I+would+like+to+discuss+a+clinical+treatment+with+XELIX+Clinical+Concierge.&type=phone_number&app_absent=0"
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-secondary-container text-on-secondary-container h-12 rounded-xl flex items-center justify-center gap-2 font-bold tracking-widest text-xs uppercase hover:opacity-90 active:scale-95 transition-all text-center"
          >
            <span className="material-symbols-outlined text-base">chat</span> WHATSAPP
          </a>
          <button
            onClick={() => startBooking()}
            className="flex-[1.5] bg-primary text-on-primary h-12 rounded-xl flex items-center justify-center gap-2 font-bold tracking-widest text-xs uppercase hover:bg-opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">calendar_month</span> BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
};
