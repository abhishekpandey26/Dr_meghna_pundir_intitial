import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SEO } from './SEO';
import { ArrowLeft, Search, Phone, MessageSquare, Calendar, ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { FAQ_DATA, FAQ_CATEGORIES, generateFaqSchemaJsonLd, FaqItem } from '../data/faqs';
import { Helmet } from 'react-helmet-async';

export const FaqView: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.keywords.some((kw) => kw.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const schemaJsonLd = useMemo(() => {
    return JSON.stringify(generateFaqSchemaJsonLd(filteredFaqs.length > 0 ? filteredFaqs : FAQ_DATA));
  }, [filteredFaqs]);

  const toggleFaq = (id: number) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen pb-24 font-sans" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
      <SEO
        title="Frequently Asked Questions (FAQs) | Dr. Megha Singh Pundir Varanasi"
        description="Find answers to all questions about skin care, acne scars, hair fall, PRP, HIFU, Botox, chemical peels, consultation fees (₹500), and timings with Dr. Megha Singh Pundir at Derm Elixir Clinic, Varanasi."
      />

      <Helmet>
        <script type="application/ld+json">{schemaJsonLd}</script>
      </Helmet>

      {/* Navigation Header */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/')} className="flex flex-col items-start cursor-pointer text-left">
          <span className="font-serif text-2xl font-semibold leading-none" style={{ color: 'var(--ink)' }}>
            Derm Elixir
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] leading-none mt-1" style={{ color: 'var(--terracotta)' }}>
            Skin · Hair · Laser
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="text-[10px] font-bold uppercase tracking-widest hover:text-amber-800 transition-colors cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/testimonials')}
            className="text-[10px] font-bold uppercase tracking-widest hover:text-amber-800 transition-colors cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            Testimonials
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest cursor-pointer" style={{ color: 'var(--terracotta)' }}>
            FAQs
          </span>
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
            Book Now
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <header className="py-16 md:py-24 px-6 text-center max-w-4xl mx-auto space-y-6">
        <span
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(184,103,79,0.1)', color: 'var(--terracotta)' }}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Patient Guidance & Answers
        </span>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
          Frequently Asked Questions
        </h1>
        <p className="text-sm md:text-base leading-relaxed text-balance" style={{ color: 'var(--muted)' }}>
          Everything you need to know about skin treatments, hair fall solutions, consultation fees, clinic timings, and appointment booking with Dr. Megha Singh Pundir in Varanasi.
        </p>

        {/* Search Input Bar */}
        <div className="pt-4 max-w-2xl mx-auto relative">
          <div className="relative flex items-center">
            <Search className="absolute left-5 w-5 h-5 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., acne, hair loss, consultation fee, HIFU, botox)..."
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

      {/* Main FAQ Content Section */}
      <main className="max-w-4xl mx-auto px-6 space-y-10">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none justify-start md:justify-center">
          {FAQ_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-[var(--border)]'
                }`}
                style={{
                  background: isActive ? 'var(--terracotta)' : undefined,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center text-xs font-medium px-1" style={{ color: 'var(--muted)' }}>
          <span>
            Showing <strong style={{ color: 'var(--ink)' }}>{filteredFaqs.length}</strong> of {FAQ_DATA.length} questions
          </span>
          {searchQuery && (
            <span>
              Search results for "<strong>{searchQuery}</strong>"
            </span>
          )}
        </div>

        {/* Accordions List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = activeFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-xs transition-all border"
                  style={{ borderColor: isOpen ? 'var(--terracotta)' : 'var(--border)' }}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider block"
                        style={{ color: 'var(--terracotta)' }}
                      >
                        {faq.category}
                      </span>
                      <h3 className="font-serif text-lg md:text-xl font-medium leading-snug" style={{ color: 'var(--ink)' }}>
                        {faq.question}
                      </h3>
                    </div>
                    <span
                      className="p-2 rounded-full transition-transform duration-300 flex-shrink-0"
                      style={{
                        background: isOpen ? 'rgba(184,103,79,0.1)' : 'var(--cream)',
                        color: 'var(--terracotta)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden border-t"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="p-6 text-sm md:text-base leading-relaxed bg-stone-50/30" style={{ color: 'var(--muted)' }}>
                          <p>{faq.answer}</p>
                          <div className="mt-5 pt-4 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <span className="text-stone-400">Dr. Megha Singh Pundir · Derm Elixir Clinic</span>
                            <button
                              onClick={() => navigate('/booking')}
                              className="font-bold text-[11px] uppercase tracking-wider hover:underline cursor-pointer"
                              style={{ color: 'var(--terracotta)' }}
                            >
                              Book Consultation →
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border space-y-4" style={{ borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-stone-100 text-stone-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold">No questions matching your search</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Try searching with different keywords like "acne", "hair fall", "botox", "address", or clear your search filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full text-white cursor-pointer"
              style={{ background: 'var(--terracotta)' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Action Callout Box */}
        <div
          className="rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: 'linear-gradient(135deg, var(--terracotta-dark) 0%, #6A2C21 100%)' }}
        >
          <div className="space-y-3 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/80">Direct Assistance</span>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold">Have a specific skin or hair question?</h2>
            <p className="text-sm text-white/80 max-w-md leading-relaxed">
              Dr. Megha Singh Pundir and our clinical team are available to guide your skincare journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href="tel:+919120010762"
              className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-stone-100"
              style={{ color: 'var(--terracotta-dark)' }}
            >
              <Phone className="w-4 h-4" /> Call Clinic
            </a>
            <a
              href="https://api.whatsapp.com/send/?phone=919120010762&text=Hello%21+I+have+a+question+about+a+treatment+at+Derm+Elixir.&type=phone_number&app_absent=0"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
              style={{ background: '#25D366' }}
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
