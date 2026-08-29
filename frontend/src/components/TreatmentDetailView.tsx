import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Stethoscope,
  ChevronDown,
  Search
} from 'lucide-react';
import { SEO } from './SEO';
import {
  getTreatmentBySlug,
  getRelatedTreatments,
  generateTreatmentSchemaJsonLd,
  TreatmentItem
} from '../data/treatmentsData';

export const TreatmentDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const treatment: TreatmentItem | undefined = slug ? getTreatmentBySlug(slug) : undefined;
  const relatedTreatments = slug ? getRelatedTreatments(slug, 4) : [];

  if (!treatment) {
    return (
      <div className="min-h-screen py-24 px-6 font-sans flex flex-col items-center justify-center text-center" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
        <SEO title="Treatment Not Found" description="The requested clinical treatment page could not be found." />
        <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center mb-6 text-stone-500">
          <Search className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-3">Treatment Page Not Found</h1>
        <p className="text-sm text-stone-500 max-w-md mb-8">
          The treatment you are looking for may have been moved or renamed. Explore our full clinical directory below.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/treatments')}
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-full text-white cursor-pointer shadow-md"
            style={{ background: 'var(--terracotta)' }}
          >
            Browse All Treatments
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-full border cursor-pointer hover:bg-stone-100"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  const schemaJsonLd = generateTreatmentSchemaJsonLd(treatment);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen pb-24 font-sans" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
      <SEO
        title={treatment.seoTitle}
        description={treatment.seoDescription}
        url={`https://drmeghapundir.in/treatments/${treatment.slug}`}
        image={treatment.heroImage}
      />

      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schemaJsonLd)}</script>
      </Helmet>

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
          <button onClick={() => navigate('/treatments')} className="hover:text-amber-800 transition-colors cursor-pointer" style={{ color: 'var(--terracotta)' }}>
            Treatments Directory
          </button>
          <button onClick={() => navigate('/faqs')} className="hover:text-amber-800 transition-colors cursor-pointer">
            FAQs
          </button>
          <button onClick={() => navigate('/testimonials')} className="hover:text-amber-800 transition-colors cursor-pointer">
            Testimonials
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/treatments')}
            className="hidden sm:flex items-center gap-1.5 font-bold uppercase tracking-[0.15em] text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Directory
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

      {/* Breadcrumb Header */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-b text-xs flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/treatments" className="hover:underline">
          Treatments
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/treatments?category=${encodeURIComponent(treatment.category)}`} className="hover:underline" style={{ color: 'var(--terracotta)' }}>
          {treatment.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-stone-800">{treatment.name}</span>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(184,103,79,0.1)', color: 'var(--terracotta)' }}>
              <Stethoscope className="w-3.5 h-3.5" /> {treatment.category} · Clinical Care
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.12]" style={{ color: 'var(--ink)' }}>
              {treatment.name} in Varanasi
            </h1>

            <p className="text-base md:text-lg leading-relaxed text-stone-600">
              {treatment.shortDescription}
            </p>

            <div className="p-4 rounded-2xl bg-white border flex items-center gap-4 shadow-xs" style={{ borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-50 text-rose-700 flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-stone-800">Supervised by Dr. Megha Singh Pundir</p>
                <p className="text-stone-500">Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi · Consultation Fee: ₹500</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/booking')}
                className="px-8 py-4 text-xs font-semibold uppercase tracking-wider rounded-full text-white transition-all active:scale-95 cursor-pointer shadow-md flex items-center gap-2"
                style={{ background: 'var(--terracotta)' }}
              >
                <Calendar className="w-4 h-4" /> Book Appointment (₹500)
              </button>
              <a
                href="https://api.whatsapp.com/send/?phone=919120010762&text=Hello%21+I+would+like+to+inquire+about+treatment+for+acne/skin+in+Varanasi.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noreferrer"
                className="px-7 py-4 text-xs font-semibold uppercase tracking-wider rounded-full text-white flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                style={{ background: '#25D366' }}
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Helpline
              </a>
              <a
                href="tel:+919120010762"
                className="px-6 py-4 text-xs font-semibold uppercase tracking-wider rounded-full border bg-white flex items-center gap-2 cursor-pointer transition-all hover:bg-stone-50"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                <Phone className="w-4 h-4" /> Call Clinic
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border bg-stone-100" style={{ borderColor: 'var(--border)' }}>
              <img
                src={treatment.heroImage}
                alt={treatment.heroImageAlt}
                className="w-full h-[400px] md:h-[480px] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Evidence-Based Practice</span>
                <p className="font-serif text-lg font-semibold">{treatment.name}</p>
                <p className="text-xs text-white/80 mt-1">Derm Elixir Clinic · Samne Ghat, Lanka, Varanasi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Overview & Candidates */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border shadow-xs space-y-6" style={{ borderColor: 'var(--border)' }}>
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>
              Clinical Overview
            </span>
            <h2 className="font-serif text-3xl font-semibold" style={{ color: 'var(--ink)' }}>
              Understanding {treatment.name}
            </h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed text-stone-600">
            {treatment.overview}
          </p>
        </section>

        {/* Symptoms / Concerns Addressed */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>
              Signs & Symptoms
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold" style={{ color: 'var(--ink)' }}>
              When to Consult a Dermatologist
            </h2>
            <p className="text-xs text-stone-500">
              You should consider a clinical evaluation if you observe any of the following concerns:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatment.symptoms.map((symptom, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border flex items-start gap-4 shadow-xs" style={{ borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-700 flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-stone-900">Clinical Indicator {idx + 1}</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{symptom}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Procedure Flow */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>
              Care Roadmap
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold" style={{ color: 'var(--ink)' }}>
              Our 4-Step Clinical Procedure Flow
            </h2>
            <p className="text-xs text-stone-500">
              Every procedure at Derm Elixir follows strict medical protocols for safety and hygiene.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {treatment.procedure.map((proc) => (
              <div key={proc.stepNumber} className="bg-white p-6 rounded-2xl border space-y-3 relative shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center font-serif text-base font-bold text-white mb-3" style={{ background: 'var(--terracotta)' }}>
                    0{proc.stepNumber}
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 leading-snug">{proc.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed mt-2">{proc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits & Outcome Goals */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border shadow-xs space-y-6" style={{ borderColor: 'var(--border)' }}>
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>
              Treatment Objectives
            </span>
            <h2 className="font-serif text-3xl font-semibold" style={{ color: 'var(--ink)' }}>
              Clinical Benefits & Goals
            </h2>
            <p className="text-xs text-stone-500">
              Treatment goals are formulated based on individual medical assessment and biological response:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {treatment.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 border border-stone-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-stone-700 font-medium leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Suitability Note */}
        <section className="p-6 rounded-2xl border bg-amber-50/60 text-amber-900 flex items-start gap-4" style={{ borderColor: 'rgba(184,103,79,0.3)' }}>
          <ShieldCheck className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
          <div className="space-y-1 text-xs leading-relaxed">
            <p className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">Important Medical Notice</p>
            <p>{treatment.suitability}</p>
          </div>
        </section>

        {/* Doctor & Clinic Highlight Card */}
        <section
          className="rounded-3xl p-8 md:p-12 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          style={{ background: 'linear-gradient(135deg, var(--terracotta-dark) 0%, #6A2C21 100%)' }}
        >
          <div className="lg:col-span-8 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Consultation in Varanasi</span>
            <h2 className="font-serif text-3xl font-semibold">Consult Dr. Megha Singh Pundir</h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-xl">
              Experienced dermatologist specializing in clinical dermatology, laser procedures, and aesthetic skin rejuvenation at Derm Elixir, Varanasi.
            </p>
            <div className="flex flex-wrap gap-4 text-xs pt-2">
              <span className="flex items-center gap-1.5 text-white/90">
                <MapPin className="w-4 h-4 text-amber-300" /> Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi
              </span>
              <span className="flex items-center gap-1.5 text-white/90">
                <Calendar className="w-4 h-4 text-amber-300" /> Mon – Sat: 10:00 AM – 08:00 PM
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <button
              onClick={() => navigate('/booking')}
              className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white cursor-pointer transition-all hover:bg-stone-100"
              style={{ color: 'var(--terracotta-dark)' }}
            >
              Book Consultation (₹500)
            </button>
            <a
              href="tel:+919120010762"
              className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/30 text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-white/10 text-center"
            >
              <Phone className="w-4 h-4" /> +91 9120010762
            </a>
          </div>
        </section>

        {/* FAQs */}
        {treatment.faqs.length > 0 && (
          <section className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>
                Search Intent & Patient Queries
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold" style={{ color: 'var(--ink)' }}>
                {treatment.name} FAQs
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 border space-y-3 shadow-xs" style={{ borderColor: 'var(--border)' }}>
              {treatment.faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="border-b last:border-0 pb-4 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left py-3 flex items-center justify-between gap-4 cursor-pointer hover:text-amber-800 transition-colors"
                    >
                      <span className="font-serif text-base md:text-lg font-medium text-stone-900">{faq.question}</span>
                      <ChevronDown
                        className="w-4 h-4 flex-shrink-0 transition-transform duration-300"
                        style={{ color: 'var(--terracotta)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2 pb-3 text-xs md:text-sm text-stone-600 leading-relaxed">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Treatments */}
        {relatedTreatments.length > 0 && (
          <section className="space-y-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>
                  Internal Linking & Taxonomy
                </span>
                <h2 className="font-serif text-3xl font-semibold" style={{ color: 'var(--ink)' }}>
                  Related {treatment.category}
                </h2>
              </div>
              <button
                onClick={() => navigate(`/treatments?category=${encodeURIComponent(treatment.category)}`)}
                className="text-xs font-bold uppercase tracking-wider hover:underline"
                style={{ color: 'var(--terracotta)' }}
              >
                View Category ({treatment.category}) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTreatments.map((rel) => (
                <div
                  key={rel.slug}
                  onClick={() => navigate(`/treatments/${rel.slug}`)}
                  className="bg-white rounded-2xl overflow-hidden border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="p-5 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 block">{rel.category}</span>
                    <h3 className="font-serif text-base font-semibold text-stone-900 leading-snug">{rel.name}</h3>
                    <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">{rel.shortDescription}</p>
                  </div>
                  <div className="p-4 border-t bg-stone-50 text-right" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--terracotta)' }}>
                      Learn More →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
