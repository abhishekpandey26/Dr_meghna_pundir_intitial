import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { InstagramSection } from './InstagramSection';

export const TestimonialsView: React.FC = () => {
  const { setView, videoTestimonials, photoTestimonials } = useApp();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Pagination states
  const [photosLimit, setPhotosLimit] = useState(6);
  const [videosLimit, setVideosLimit] = useState(4);

  // Helper to extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Helper to get YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
  };

  return (
    <div className="min-h-screen pb-24 font-sans" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
      {/* Top Bar Navigation */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Logo */}
        <button onClick={() => setView('landing')} className="flex flex-col items-start cursor-pointer text-left">
          <span className="font-serif text-2xl font-semibold leading-none" style={{ color: 'var(--ink)' }}>Derm Elixir</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] leading-none mt-1" style={{ color: 'var(--terracotta)' }}>Skin · Hair · Laser</span>
        </button>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => setView('landing')} className="text-[10px] font-bold uppercase tracking-widest hover:text-amber-800 transition-colors cursor-pointer" style={{ color: 'var(--muted)' }}>Home</button>
          <span className="text-[10px] font-bold uppercase tracking-widest cursor-pointer" style={{ color: 'var(--terracotta)' }}>Testimonials</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('landing')}
            className="flex items-center gap-1.5 font-bold uppercase tracking-[0.15em] text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Lobby
          </button>
          <button
            onClick={() => setView('booking')}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-[0.05em] rounded-full text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            style={{ background: 'var(--terracotta)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-accent)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--terracotta)')}
          >
            Book Now
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <header className="relative w-full h-[360px] md:h-[500px] lg:h-[540px] overflow-hidden flex items-center">
        {/* Background Image */}
        <img
          src="/assets/testimonials/hero-procedure.jpg"
          alt="Derm Elixir Testimonials Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={(e) => {
            // Clinical skin treatment process fallback image
            e.currentTarget.src = "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=1200";
          }}
        />
        {/* Dark responsive overlay gradients for readability */}
        <div 
          className="absolute inset-0 z-10 bg-[linear-gradient(to_top,rgba(25,18,17,0.95)_0%,rgba(25,18,17,0.5)_60%,rgba(25,18,17,0.2)_100%)] lg:bg-[linear-gradient(90deg,rgba(25,18,17,0.85)_0%,rgba(25,18,17,0.45)_55%,rgba(25,18,17,0.05)_100%)]"
        />

        {/* Content container */}
        <div className="max-w-7xl mx-auto px-6 w-full relative z-20">
          <div className="max-w-2xl text-center lg:text-left flex flex-col items-center lg:items-start space-y-6">
            <span
              className="inline-block text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border backdrop-blur-md"
              style={{ 
                color: '#FFFFFF', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderColor: 'rgba(255,255,255,0.25)' 
              }}
            >
              VERIFIED RESULTS
            </span>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] text-white">
              Real Skin &amp; Hair Transformations
            </h1>
            <p className="text-sm md:text-base leading-relaxed max-w-xl text-white/80">
              See actual results from our treatments at Derm Elixir — verified before and after photos from real patients.
            </p>
            <div className="pt-2">
              <button
                onClick={() => document.getElementById('diaries')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-white transition-all active:scale-95 cursor-pointer shadow-md hover:bg-neutral-50"
                style={{ color: 'var(--terracotta-dark)' }}
              >
                View All Results
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BEFORE & AFTER PHOTO TESTIMONIALS SECTION */}
      <section id="diaries" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold" style={{ color: 'var(--ink)' }}>
            Transformation Diaries
          </h2>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>
            Verified patient skin progression records
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photoTestimonials.slice(0, photosLimit).map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Before/After Split Container */}
              <div className="grid grid-cols-2 aspect-square relative bg-stone-100 overflow-hidden">
                <div className="relative h-full w-full border-r" style={{ borderColor: 'var(--border)' }}>
                  <LazyImage src={item.beforeUrl} alt={`${item.title} Before`} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
                    Before
                  </div>
                </div>
                <div className="relative h-full w-full">
                  <LazyImage src={item.afterUrl} alt={`${item.title} After`} className="w-full h-full object-cover" />
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
        </div>

        {/* Load More Button for Photos */}
        {photoTestimonials.length > photosLimit && (
          <div className="text-center mt-12">
            <button
              onClick={() => setPhotosLimit(prev => prev + 6)}
              className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-full text-white transition-all active:scale-95 cursor-pointer shadow-md"
              style={{ background: 'var(--terracotta)' }}
            >
              See More Transformations
            </button>
          </div>
        )}
      </section>

      {/* VIDEO TESTIMONIALS SECTION */}
      <section className="py-20 px-6 bg-white" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold" style={{ color: 'var(--ink)' }}>
              Video Testimonials
            </h2>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>
              Our patients share their treatment journeys
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videoTestimonials.slice(0, videosLimit).map((item, idx) => {
              const youtubeId = getYouTubeId(item.youtubeUrl);
              const isActive = activeVideoId === item._id;

               return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (idx % 2) * 0.1 }}
                  className="bg-white p-5 rounded-[28px] shadow-sm flex flex-col transition-all hover:shadow-md"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="aspect-video relative bg-black overflow-hidden rounded-2xl">
                    {isActive && youtubeId ? (
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
                        onClick={() => setActiveVideoId(item._id || null)}
                      >
                        <LazyImage
                          src={getYouTubeThumbnail(item.youtubeUrl)}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center z-10">
                          <svg className="w-16 h-12 transition-transform duration-300 group-hover:scale-110 drop-shadow-md" viewBox="0 0 68 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79 0 34 0 34 0S12.21 0 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C0 13.06 0 24 0 24s0 10.94 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 48 34 48 34 48s21.79 0 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C68 34.94 68 24 68 24s0-10.94-1.48-16.26z" fill="#FF0000"/>
                            <path d="M45 24L27 14v20l18-10z" fill="#FFFFFF"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-5 pb-1 text-center">
                    <h3 className="font-serif text-[22px] font-semibold tracking-tight" style={{ color: 'var(--terracotta-dark)' }}>
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load More Button for Videos */}
          {videoTestimonials.length > videosLimit && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVideosLimit(prev => prev + 4)}
                className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-full text-white transition-all active:scale-95 cursor-pointer shadow-md"
                style={{ background: 'var(--terracotta)' }}
              >
                See More Video Testimonials
              </button>
            </div>
          )}
        </div>
      </section>
      
      {/* Instagram Section */}
      <InstagramSection />
    </div>
  );
};
