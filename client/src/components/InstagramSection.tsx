import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../config';

interface InstagramPost {
  _id: string;
  instagramUrl: string;
  mediaType: 'image' | 'reel';
  thumbnailUrl: string;
  fullMediaUrl: string;
  caption?: string;
  order: number;
}

const getMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const serverBase = API_BASE.replace('/api', '');
    return `${serverBase}${url}`;
  }
  return url;
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: -60,
    scale: 0.94
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 110,
      damping: 12,
      mass: 0.8
    }
  }
};

export const InstagramSection: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/instagram-posts?page=${page}&limit=8`)
      .then(res => res.json())
      .then(data => {
        if (page === 1) {
          setPosts(data.posts || []);
        } else {
          setPosts(prev => [...prev, ...(data.posts || [])]);
        }
        if (data.posts.length < 8 || data.page >= data.pages) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      })
      .catch(err => console.error('Error fetching Instagram posts:', err));
  }, [page]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null && activeIdx < posts.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  };

  const currentPost = activeIdx !== null ? posts[activeIdx] : null;

  return (
    <section className="py-20 px-0 relative overflow-hidden" style={{ background: 'var(--white)' }} id="instagram">
      <div className="max-w-7xl mx-auto px-5 md:px-16 mb-8 text-center">
        <motion.span 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] font-bold uppercase tracking-[0.2em] block" 
          style={{ color: 'var(--terracotta)' }}
        >
          Connect With Us
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-4xl md:text-5xl font-semibold mt-2 mb-8 uppercase tracking-wider" 
          style={{ color: 'var(--ink)' }}
        >
          Follow on Instagram
        </motion.h2>

        {/* Profile Row */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center space-y-2 mb-10"
        >
          <a 
            href="https://www.instagram.com/derm.elixir/?hl=en" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-[72px] h-[72px] rounded-full border-2 p-0.5 overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
            style={{ borderColor: 'var(--gold-accent)' }}
          >
            <img 
              src="/meghna_Ai.jpg" 
              alt="Derm Elixir Avatar" 
              className="w-full h-full object-cover rounded-full" 
              onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&q=80'; }}
            />
          </a>
          <div>
            <a 
              href="https://www.instagram.com/derm.elixir/?hl=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-sans font-bold text-base hover:underline"
              style={{ color: 'var(--ink)' }}
            >
              @derm.elixir
            </a>
            <p className="text-xs font-medium tracking-tight mt-1" style={{ color: 'var(--terracotta)' }}>
              Advanced skin, hair &amp; laser care by Dr. Megha Pundir Singh
            </p>
          </div>
        </motion.div>
      </div>

      {/* Grid: 4 columns on desktop, 2 on tablet, 1-2 on mobile */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-1.5 px-1 md:px-1.5 max-w-[1400px] mx-auto"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            variants={cardVariants}
            onClick={() => setActiveIdx(index)}
            className="group relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer"
            style={{ transition: 'transform 0.2s ease-in-out' }}
            onMouseEnter={e => {
              const img = e.currentTarget.querySelector('.ig-thumb') as HTMLElement | null;
              if (img) img.style.transform = 'scale(1.03)';
              const overlay = e.currentTarget.querySelector('.ig-overlay') as HTMLElement | null;
              if (overlay) overlay.style.opacity = '1';
            }}
            onMouseLeave={e => {
              const img = e.currentTarget.querySelector('.ig-thumb') as HTMLElement | null;
              if (img) img.style.transform = 'scale(1)';
              const overlay = e.currentTarget.querySelector('.ig-overlay') as HTMLElement | null;
              if (overlay) overlay.style.opacity = '0';
            }}
          >
            <img
              src={getMediaUrl(post.thumbnailUrl)}
              alt={post.caption || 'Instagram post'}
              className="ig-thumb w-full h-full object-cover transition-transform duration-200"
              style={{ objectFit: 'cover' }}
              onError={e => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80';
              }}
            />

            {/* If reel/video, show centered white play triangle */}
            {post.mediaType === 'reel' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Hover overlay */}
            <div 
              className="ig-overlay absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 flex flex-col justify-end p-4 z-20"
            >
              {post.caption && (
                <p className="text-white text-xs line-clamp-3 leading-normal font-sans font-normal">
                  {post.caption}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 px-5"
      >
        {hasMore && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-white transition-all duration-300 border-0 cursor-pointer"
            style={{ background: 'var(--terracotta-dark)' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Load More
          </button>
        )}
        <a
          href="https://www.instagram.com/derm.elixir/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all duration-300 text-center flex items-center justify-center gap-2 cursor-pointer"
          style={{ border: '1.5px solid var(--terracotta-dark)', color: 'var(--terracotta-dark)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--blush)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          {/* Instagram SVG Icon */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          Follow on Instagram
        </a>
      </motion.div>

      {/* Modal Lightbox */}
      {currentPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in"
          onClick={() => setActiveIdx(null)}
          onKeyDown={e => {
            if (e.key === 'Escape') setActiveIdx(null);
          }}
          tabIndex={0}
        >
          {/* Close button */}
          <button 
            onClick={() => setActiveIdx(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 cursor-pointer border-0 bg-transparent"
          >
            <span className="material-symbols-outlined text-3xl font-bold">close</span>
          </button>

          {/* Prev Arrow */}
          {activeIdx !== null && activeIdx > 0 && (
            <button 
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-30 cursor-pointer border-0"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
            </button>
          )}

          {/* Next Arrow */}
          {activeIdx !== null && activeIdx < posts.length - 1 && (
            <button 
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-30 cursor-pointer border-0"
            >
              <span className="material-symbols-outlined text-2xl">arrow_forward_ios</span>
            </button>
          )}

          {/* Modal Container */}
          <div 
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col max-h-[85vh] z-20"
            onClick={e => e.stopPropagation()}
          >
            {/* Embed Iframe Frame */}
            <div className="relative aspect-[4/5] bg-neutral-900 flex-1 min-h-[300px]">
              {currentPost.instagramUrl.includes('instagram.com') ? (
                <iframe
                  src={currentPost.fullMediaUrl}
                  className="w-full h-full border-0 absolute inset-0"
                  allowTransparency={true}
                  allow="encrypted-media"
                  scrolling="no"
                  title="Instagram Embed"
                />
              ) : currentPost.mediaType === 'reel' ? (
                <video
                  src={currentPost.fullMediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={currentPost.fullMediaUrl}
                  alt={currentPost.caption || 'Instagram Post'}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Caption & Info Panel */}
            {currentPost.caption && (
              <div className="p-5 border-t border-neutral-100 bg-white">
                <p className="text-sm leading-relaxed text-neutral-800 font-sans font-normal">
                  {currentPost.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
