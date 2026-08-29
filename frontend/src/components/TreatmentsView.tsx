import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from './SEO';
import { ArrowLeft, Search, Sparkles, Filter, ChevronRight, Stethoscope } from 'lucide-react';
import {
  TREATMENTS_DATA,
  TREATMENT_CATEGORIES,
  TreatmentCategory,
  TreatmentItem,
  searchTreatments
} from '../data/treatmentsData';

export const TreatmentsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategoryParam = searchParams.get('category') as TreatmentCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam || 'All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialCategoryParam && TREATMENT_CATEGORIES.includes(initialCategoryParam)) {
      setSelectedCategory(initialCategoryParam);
    }
  }, [initialCategoryParam]);

  const filteredTreatments = useMemo(() => {
    return searchTreatments(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="min-h-screen pb-24 font-sans" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
      <SEO
        title="Dermatological Treatments Directory | Dr. Megha Singh Pundir Varanasi"
        description="Browse 100+ specialized clinical skin treatments, hair fall therapies, laser hair removal, cosmetic injectables, chemical peels, and anti-aging procedures in Varanasi with Dr. Megha Singh Pundir."
        url="https://drmeghapundir.in/treatments"
      />

      {/* Top Navbar */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/')} className="flex flex-col items-start cursor-pointer text-left">
          <span className="font-serif text-2xl font-semibold leading-none" style={{ color: 'var(--ink)' }}>
            Derm Elixir
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] leading-none mt-1" style={{ color: 'var(--terracotta)' }}>
            Skin · Hair · Laser
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          <button onClick={() => navigate('/')} className="hover:text-amber-800 transition-colors cursor-pointer">
            Home
          </button>
          <span className="cursor-pointer" style={{ color: 'var(--terracotta)' }}>
            Treatments Directory
          </span>
          <button onClick={() => navigate('/faqs')} className="hover:text-amber-800 transition-colors cursor-pointer">
            FAQs
          </button>
          <button onClick={() => navigate('/testimonials')} className="hover:text-amber-800 transition-colors cursor-pointer">
            Testimonials
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 font-bold uppercase tracking-[0.15em] text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </button>
          <button
            onClick={() => navigate('/booking')}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-[0.05em] rounded-full text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            style={{ background: 'var(--terracotta)' }}
          >
            Book Consult
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <header className="py-14 md:py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
        <span
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(184,103,79,0.1)', color: 'var(--terracotta)' }}
        >
          <Stethoscope className="w-3.5 h-3.5" /> Comprehensive Clinical Taxonomy
        </span>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
          Treatments &amp; Clinical Procedures
        </h1>
        <p className="text-sm md:text-base leading-relaxed text-stone-600 max-w-2xl mx-auto">
          Explore evidence-based medical dermatology, laser procedures, trichology hair restoration, and aesthetic rejuvenation offered by Dr. Megha Singh Pundir in Varanasi.
        </p>

        {/* Live Search Bar */}
        <div className="pt-4 max-w-2xl mx-auto relative">
          <div className="relative flex items-center">
            <Search className="absolute left-5 w-5 h-5 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ treatments (e.g. acne, botox, prp, chemical peel, hifu)..."
              className="w-full pl-13 pr-10 py-4 text-sm bg-white rounded-2xl border shadow-sm outline-none transition-all focus:ring-2 focus:ring-[var(--terracotta)]"
              style={{ borderColor: 'var(--border)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-xs font-semibold uppercase text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 space-y-10">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none justify-start">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'text-white shadow-sm'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-[var(--border)]'
            }`}
            style={{
              background: selectedCategory === 'All' ? 'var(--terracotta)' : undefined,
            }}
          >
            All Categories ({TREATMENTS_DATA.length})
          </button>
          {TREATMENT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = TREATMENTS_DATA.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-[var(--border)]'
                }`}
                style={{
                  background: isActive ? 'var(--terracotta)' : undefined,
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center text-xs font-medium px-1" style={{ color: 'var(--muted)' }}>
          <span>
            Showing <strong style={{ color: 'var(--ink)' }}>{filteredTreatments.length}</strong> treatments
          </span>
          {searchQuery && (
            <span>
              Results for "<strong>{searchQuery}</strong>"
            </span>
          )}
        </div>

        {/* Treatment Cards Grid */}
        {filteredTreatments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTreatments.map((treatment) => (
              <div
                key={treatment.slug}
                onClick={() => navigate(`/treatments/${treatment.slug}`)}
                className="bg-white rounded-2xl overflow-hidden border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                      {treatment.category}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">Dr. Megha · Varanasi</span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-stone-900 leading-snug hover:text-amber-800 transition-colors">
                    {treatment.name}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                    {treatment.shortDescription}
                  </p>
                </div>

                <div className="p-4 px-6 border-t bg-stone-50/50 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs text-stone-500">View Detail Page</span>
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--terracotta)' }}>
                    Learn More <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border space-y-4" style={{ borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-stone-100 text-stone-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold">No treatments found matching your filter</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Try typing another search word like "acne", "hair", "laser", "peel", "botox", or choose another category filter above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategorySelect('All');
              }}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full text-white cursor-pointer"
              style={{ background: 'var(--terracotta)' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* CTA Box */}
        <div
          className="rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: 'linear-gradient(135deg, var(--terracotta-dark) 0%, #6A2C21 100%)' }}
        >
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Personalized Medical Care</span>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold">Need help choosing the right treatment?</h2>
            <p className="text-sm text-white/80 max-w-md leading-relaxed">
              Schedule a comprehensive clinical consultation with Dr. Megha Singh Pundir in Varanasi.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/booking')}
              className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white cursor-pointer transition-all hover:bg-stone-100 shadow-md"
              style={{ color: 'var(--terracotta-dark)' }}
            >
              Book Consultation (₹500)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
