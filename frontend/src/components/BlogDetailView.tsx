import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from './SEO';
import { BlogPost } from '../types';
import { InstagramSection } from './InstagramSection';
import { ArrowLeft, Calendar, User, Clock, Search } from 'lucide-react';
import { API_BASE } from '../config';

const getMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const serverBase = API_BASE.replace('/api', '');
    return `${serverBase}${url}`;
  }
  return url;
};

export const BlogDetailView: React.FC = () => {
  const { blogs } = useApp();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }

    setLoading(true);
    setPost(null);

    // Check locally first
    const localPost = blogs.find(b => b.slug === slug);
    if (localPost) {
      setPost(localPost);
      setLoading(false);
    } else {
      // Fetch from backend
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
  }, [slug, blogs, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--terracotta)]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl text-[var(--ink)] font-bold mb-4">Article Not Found</h2>
        <p className="text-neutral-500 mb-6">The blog post you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[var(--terracotta)] text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-[var(--terracotta-dark)] transition-all cursor-pointer border-0"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] text-neutral-800 selection:bg-[var(--blush)]">
      <SEO 
        title={post.title} 
        description={post.summary || 'Read our latest blog post on Derm Elixir.'} 
        image={getMediaUrl(post.image)}
        url={window.location.href}
        type="article"
        articleData={{
          author: post.author,
          section: post.category,
          publishedTime: post.dateString // Optionally format if needed
        }}
      />
      {/* Navigation */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-stone-200/40 bg-transparent">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[var(--ink)] transition-all cursor-pointer"
          style={{ background: 'none', border: 'none' }}
        >
          <ArrowLeft className="w-4 h-4 text-[var(--terracotta)]" />
          Back to Home
        </button>
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tighter text-[var(--ink)]">DERMELIXIR</span>
          <span className="text-[10px] font-bold tracking-widest uppercase bg-[var(--blush)] text-[var(--terracotta)] px-3 py-1 rounded-full border border-[var(--rose)]/15">BLOG</span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        
        {/* Top Info & Title (Cream background, no dark banner) */}
        <div className="space-y-4 max-w-4xl mb-8">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--terracotta)]">
            <span>{post.category}</span>
            <span>•</span>
            <span className="text-neutral-500">{post.dateString}</span>
          </div>
          <h1 
            className="font-serif text-3xl md:text-[44px] font-bold tracking-tight leading-tight"
            style={{ color: 'var(--terracotta-dark)' }}
          >
            {post.title}
          </h1>
          <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[var(--terracotta)]" /> By {post.author}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Image + Article Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Main cover photo below title */}
            <div className="w-full overflow-hidden rounded-2xl shadow-sm border border-stone-200/30">
              <img 
                src={getMediaUrl(post.image)} 
                alt={post.title} 
                className="w-full aspect-[21/9] md:aspect-[16/8] object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80';
                }}
              />
            </div>

            <article className="prose prose-neutral max-w-none space-y-8">
              {post.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('###')) {
                  return (
                    <h3 
                      key={idx} 
                      className="font-serif text-2xl font-semibold mt-12 mb-4 leading-tight"
                      style={{ color: 'var(--terracotta)' }}
                    >
                      {paragraph.replace('###', '').trim()}
                    </h3>
                  );
                }
                if (paragraph.startsWith('-')) {
                  return (
                    <ul key={idx} className="list-disc pl-6 space-y-3.5 my-6">
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
            </article>

            <div className="h-px bg-stone-200/60 my-12" />

            <div className="text-center lg:text-left">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-[var(--terracotta)] text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-[var(--terracotta-dark)] transition-all cursor-pointer shadow-lg shadow-neutral-900/10 border-0"
              >
                Back to Articles
              </button>
            </div>
          </div>

          {/* Right Column: Sidebar (Search + Recent Posts) */}
          <aside className="lg:col-span-4 space-y-8 lg:border-l lg:border-stone-200/50 lg:pl-10">
            {/* Search Input Bar */}
            <form 
              onSubmit={(e) => e.preventDefault()} 
              className="flex rounded-xl overflow-hidden border border-stone-200/65 shadow-sm bg-white"
            >
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 px-4 py-3 text-xs outline-none text-neutral-800 focus:outline-none"
              />
              <button 
                type="submit" 
                className="px-5 bg-[var(--terracotta)] text-white hover:bg-[var(--terracotta-dark)] transition-colors flex items-center justify-center border-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--ink)] tracking-tight uppercase">
                {searchQuery ? 'Search Results' : 'Recent Posts'}
              </h3>
              <div className="w-10 h-0.5 bg-[var(--terracotta)]" />
            </div>

            <div className="space-y-6">
              {(searchQuery
                ? blogs.filter(b => 
                    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    b.content.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : blogs.filter(b => b.slug !== post.slug)
              )
                .slice(0, 4)
                .map((recentPost) => (
                  <div 
                    key={recentPost._id} 
                    className="flex gap-4 items-start group cursor-pointer"
                    onClick={() => {
                      navigate('/blog/' + recentPost.slug);
                      setSearchQuery('');
                    }}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 shadow-sm border border-neutral-100">
                      <img 
                        src={getMediaUrl(recentPost.image)} 
                        alt={recentPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80';
                        }}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--terracotta)] block">
                        {recentPost.category}
                      </span>
                      <h4 className="font-serif text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--terracotta)] transition-colors leading-snug line-clamp-2">
                        {recentPost.title}
                      </h4>
                      <span className="text-[9px] text-neutral-400 block font-medium">
                        {recentPost.dateString}
                      </span>
                    </div>
                  </div>
                ))}
              {searchQuery && blogs.filter(b => 
                b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                b.content.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <p className="text-xs text-neutral-400 font-medium">No matching articles found.</p>
              )}
              {!searchQuery && blogs.filter(b => b.slug !== post.slug).length === 0 && (
                <p className="text-xs text-neutral-400 font-medium">No other recent articles.</p>
              )}
            </div>
          </aside>

        </div>
      </div>

      {/* Instagram Section */}
      <InstagramSection />

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-100 text-center text-neutral-400 text-[10px] font-bold uppercase tracking-wider bg-[var(--cream)]">
        © 2026 Dermelixir Medical Systems · Varanasi
      </footer>
    </div>
  );
};
