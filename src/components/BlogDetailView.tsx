import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BlogPost } from '../types';

export const BlogDetailView: React.FC = () => {
  const { setView, blogs } = useApp();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const getSlug = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug') || '';
  };

  const slug = getSlug();

  useEffect(() => {
    if (!slug) {
      setView('landing');
      return;
    }
    
    // Check locally first
    const localPost = blogs.find(b => b.slug === slug);
    if (localPost) {
      setPost(localPost);
      setLoading(false);
    } else {
      // Fetch from backend
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      fetch(`${API_BASE}/blogs/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setPost(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
    // Scroll to top
    window.scrollTo(0, 0);
  }, [slug, blogs, setView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl text-emerald-950 font-bold mb-4">Article Not Found</h2>
        <p className="text-neutral-500 mb-6">The blog post you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => setView('landing')}
          className="px-6 py-3 bg-emerald-900 text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-emerald-800 transition-all cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-neutral-100">
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-emerald-950 transition-all cursor-pointer"
          style={{ background: 'none', border: 'none' }}
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </button>
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tighter text-emerald-950">DERMELIXIR</span>
          <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-900/5">BLOG</span>
        </div>
      </nav>

      {/* Header Banner */}
      <header className="relative bg-emerald-950 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${post.image})` }} />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <span>{post.category}</span>
            <span>•</span>
            <span>{post.dateString}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
            {post.title}
          </h1>
          <p className="text-emerald-100/60 text-xs font-bold uppercase tracking-wider">
            By {post.author}
          </p>
        </div>
      </header>

      {/* Article Contents */}
      <article className="max-w-3xl mx-auto py-16 px-6">
        <div className="prose prose-neutral max-w-none space-y-8">
          {post.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('###')) {
              return (
                <h3 key={idx} className="font-serif text-2xl font-bold text-emerald-950 mt-10 mb-4">
                  {paragraph.replace('###', '').trim()}
                </h3>
              );
            }
            if (paragraph.startsWith('-')) {
              return (
                <ul key={idx} className="list-disc pl-6 space-y-2 my-4">
                  {paragraph.split('\n').map((li, liIdx) => (
                    <li key={liIdx} className="text-neutral-600 leading-relaxed font-medium">
                      {li.replace('-', '').trim()}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-base md:text-lg text-neutral-600 leading-relaxed font-medium text-justify">
                {paragraph}
              </p>
            );
          })}
        </div>

        <div className="h-px bg-neutral-200/60 my-16" />

        <div className="text-center">
          <button
            onClick={() => setView('landing')}
            className="px-8 py-4 bg-emerald-950 text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-emerald-900 transition-all cursor-pointer shadow-lg shadow-emerald-950/15"
          >
            Back to Articles
          </button>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-100 text-center text-neutral-400 text-xs font-semibold uppercase tracking-wider">
        © 2026 Dermelixir Medical Systems · Varanasi
      </footer>
    </div>
  );
};
