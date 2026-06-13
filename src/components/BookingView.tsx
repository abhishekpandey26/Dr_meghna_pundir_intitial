import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export const BookingView: React.FC = () => {
  const {
    setView,
    clinicConfig,
    blockedDates,
    selectedTreatmentForBooking: initialTreatment,
    setSelectedTreatmentForBooking,
    lockSlot,
    initiatePayment,
    verifyPayment
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>(initialTreatment || '');
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', age: '', concern: '' });
  const [formErrors, setFormErrors] = useState<string>('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

  const stepTitles = ['Select Date', 'Select Time', 'Select Domain', 'Patient Details', 'Summary'];

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      days.push(`${month} ${dayNum < 10 ? '0' + dayNum : dayNum}`);
    }
    return days;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id');
    const requestId = params.get('payment_request_id');
    const appointmentId = params.get('appointmentId');

    if (paymentId && requestId && appointmentId) {
      const checkPayment = async () => {
        setIsVerifyingPayment(true);
        try {
          const res = await verifyPayment(paymentId, requestId, appointmentId);
          if (res.success) setStep(6);
          else alert('Verification failed: ' + res.message);
        } catch (err) {
          alert('Network encryption error.');
        } finally {
          setIsVerifyingPayment(false);
          window.history.replaceState({}, '', window.location.pathname + '?view=booking');
        }
      };
      checkPayment();
    }
  }, [verifyPayment]);

  useEffect(() => {
    if (!selectedDate && calendarDays.length > 0) setSelectedDate(calendarDays[0]);
  }, [calendarDays, selectedDate]);

  const generatedTimeSlots = useMemo(() => {
    const parse = (s: string) => parseInt(s.split(':')[0]) * 60 + parseInt(s.split(':')[1]);
    let current = parse(clinicConfig.startHour);
    const end = parse(clinicConfig.endHour);
    const slots = [];
    while (current + clinicConfig.slotDuration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push(`${(h > 12 ? h - 12 : h || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`);
      current += clinicConfig.slotDuration;
    }
    return slots;
  }, [clinicConfig]);

  const handleSelectTime = async (time: string) => {
    const res = await lockSlot(selectedDate, time);
    if (res.error) return alert(res.message);
    setSelectedTime(time);
    setStep(3);
  };

  const validateAndReview = () => {
    if (!formData.name || !formData.mobile || !formData.email || !formData.age) return setFormErrors('Required medical fields missing');
    setStep(5);
  };

  const handleCompleteBooking = async () => {
    const res = await initiatePayment({
      date: selectedDate, startTime: selectedTime,
      patientData: { 
        ...formData, 
        patientName: formData.name,
        age: parseInt(formData.age), 
        treatment: selectedTreatment 
      }
    });
    if (res.success && res.longurl) window.location.href = res.longurl;
  };

  const triggerReset = () => {
    setStep(1); setView('landing');
  };

  return (
    <div className="bg-[#fcf8fa] text-neutral-900 min-h-screen font-sans selection:bg-emerald-900 selection:text-white">
      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-3xl border-b border-emerald-950/5 px-6 md:px-20 h-20 flex items-center justify-between">
        <span onClick={triggerReset} className="font-serif text-3xl font-bold tracking-tighter text-emerald-950 cursor-pointer">DERMELIXIR</span>
        <button onClick={triggerReset} className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 hover:opacity-50 transition-all opacity-40">
          <X size={14} /> Exit Portal
        </button>
      </nav>

      <main className="pt-24 pb-20 px-4 md:px-6 overflow-x-hidden">
        {step < 5 && (
          <div className="max-w-xl mx-auto mb-10 md:mb-16">
            <div className="flex justify-between items-end mb-3">
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-emerald-900/30">Medical Path</p>
                <h2 className="font-serif text-lg md:text-xl font-bold text-emerald-950 leading-none">{stepTitles[step - 1]}</h2>
              </div>
              <p className="text-[9px] font-bold text-emerald-900/40 uppercase tracking-widest">{step} / 5</p>
            </div>
            <div className="h-px bg-emerald-900/5 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${(step / 5) * 100}%` }} className="h-full bg-emerald-900" transition={{ type: 'spring', damping: 20 }} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-4xl mx-auto">
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-emerald-950 text-center mb-8 md:mb-12 tracking-tighter">Choose Your Date</h1>
              <div className="glass-card bg-white/60 p-5 md:p-12 rounded-[32px] md:rounded-[50px] shadow-2xl shadow-emerald-900/5 grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 border border-white">
                <div className="md:col-span-3 space-y-10">
                  <div className="flex items-center justify-between px-4">
                    <button className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center hover:bg-emerald-900 hover:text-white transition-all"><ChevronLeft size={16} /></button>
                    <span className="font-serif text-2xl font-bold italic text-emerald-950">{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center hover:bg-emerald-900 hover:text-white transition-all"><ChevronRight size={16} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 md:gap-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[9px] font-bold text-emerald-900/20 text-center uppercase">{d}</span>)}
                    {[29, 30, 31].map(n => <span key={n} className="aspect-square flex items-center justify-center text-[11px] font-bold text-neutral-200">{n}</span>)}
                    {calendarDays.map((d, i) => {
                      const num = parseInt(d.split(' ')[1]);
                      const blocked = blockedDates.includes(d);
                      const active = selectedDate === d;
                      return (
                        <button key={d} disabled={blocked} onClick={() => setSelectedDate(d)} className={`aspect-square rounded-2xl flex items-center justify-center text-[13px] font-bold transition-all ${blocked ? 'opacity-20 cursor-not-allowed' : active ? 'bg-emerald-900 text-white shadow-xl shadow-emerald-900/40' : 'bg-white/40 hover:bg-emerald-50 border border-emerald-900/5'}`}>
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col justify-center space-y-6 md:space-y-8 bg-emerald-900/[0.03] p-6 md:p-10 rounded-[32px] border border-emerald-900/5">
                  <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-emerald-900/40">Next Availability</p>
                  <p className="font-serif text-2xl md:text-3xl font-bold text-emerald-950">{selectedDate || 'Select Date'}</p>
                  <button onClick={() => setStep(2)} className="bg-emerald-950 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all">Proceed to Slots</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="max-w-4xl mx-auto text-center">
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-emerald-950 mb-4 tracking-tighter">Select Time</h1>
              <p className="text-[10px] font-bold text-emerald-900/40 uppercase tracking-[0.3em] mb-10 md:mb-16 italic underline underline-offset-8 decoration-emerald-900/10">Reserved for {selectedDate}</p>
              <div className="glass-card bg-white/60 p-5 md:p-12 rounded-[32px] md:rounded-[50px] shadow-2xl shadow-emerald-900/5 space-y-8 md:space-y-12 border border-white">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {generatedTimeSlots.map(t => (
                    <button key={t} onClick={() => handleSelectTime(t)} className={`py-5 rounded-2xl text-[11px] font-bold tracking-widest transition-all ${selectedTime === t ? 'bg-emerald-900 text-white shadow-xl' : 'bg-white/70 hover:bg-emerald-50 border border-emerald-900/5 text-emerald-950'}`}>
                      {t.split(' ')[0]}
                    </button>
                  ))}
                </div>
                <div className="flex justify-start"><button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/40 hover:text-emerald-950 transition-all flex items-center gap-2 underline">← Change Date</button></div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto text-center">
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-emerald-950 mb-10 md:mb-16 tracking-tighter">Clinical Domain</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {['Acne Therapy', 'Laser Resurfacing', 'Hair Restoration', 'Medical Consult'].map(t => (
                  <button key={t} onClick={() => { setSelectedTreatment(t); setStep(4); }} className="glass-card bg-white/60 p-8 md:p-12 rounded-[32px] md:rounded-[40px] text-left border border-white shadow-xl shadow-emerald-900/5 hover:border-emerald-900/20 group transition-all">
                    <p className="font-serif text-2xl md:text-3xl font-bold text-emerald-950 mb-2 group-hover:italic transition-all">{t}</p>
                    <p className="text-[9px] font-bold text-emerald-900/40 uppercase tracking-[0.3em]">Specialized Diagnostic Session</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="mt-12 text-[10px] font-bold text-emerald-900/40 uppercase tracking-widest underline">Adjust Time Slot</button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-emerald-950 text-center mb-8 md:mb-12 tracking-tighter">Patient Profile</h1>
              <div className="glass-card bg-white/60 p-6 md:p-12 rounded-[32px] md:rounded-[50px] border border-white shadow-2xl shadow-emerald-900/5 space-y-8 md:space-y-10">
                {formErrors && <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-rose-100">{formErrors}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {['name', 'mobile', 'email', 'age'].map(f => (
                    <div key={f} className="space-y-3">
                      <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-emerald-900/30 ml-2">{f === 'name' ? 'Legal Name' : f}</label>
                      <input type={f === 'age' ? 'number' : 'text'} name={f} value={(formData as any)[f]} onChange={e => setFormData({ ...formData, [f]: e.target.value })} className="w-full bg-white/50 border border-emerald-900/5 rounded-[24px] py-5 px-8 text-[13px] font-medium text-emerald-950 focus:border-emerald-900 transition-all outline-none" placeholder={`Patient ${f}...`} />
                    </div>
                  ))}
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-emerald-900/30 ml-2">Clinical Concern</label>
                    <textarea value={formData.concern} onChange={e => setFormData({ ...formData, concern: e.target.value })} className="w-full bg-white/50 border border-emerald-900/5 rounded-[32px] py-6 px-8 text-[13px] font-medium text-emerald-950 focus:border-emerald-900 transition-all outline-none resize-none" rows={4} placeholder="Describe your skin aspirations..." />
                  </div>
                </div>
                <button onClick={validateAndReview} className="w-full bg-emerald-950 text-white py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all">Proceed to Summary</button>
              </div>
            </motion.div>
          )}          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto px-4 relative">
              {/* Ambient Background Glows */}
              <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />

              <div className="text-center mb-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-800 bg-emerald-100/40 px-3 py-1.5 rounded-full border border-emerald-900/5">Step 5 of 5</span>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-emerald-950 mt-3 tracking-tighter">Finalize Visit</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/40 mt-1">Verify Details & Confirm Booking</p>
              </div>

              {/* Main Container - Split Layout - Center Aligned Vertically */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center relative z-10">
                
                {/* Left Side: Summary Card (Ticket style) - 3 cols */}
                <div className="lg:col-span-3 glass-card bg-white/70 border border-white rounded-[32px] shadow-2xl shadow-emerald-950/5 overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-emerald-950 text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-900/30 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-emerald-300">Appointment Pass</p>
                    <h2 className="font-serif text-2xl font-bold mt-1 tracking-tight">{formData.name}</h2>
                    <p className="text-[11px] text-emerald-200/70 mt-1 tracking-wider">{formData.email} &bull; {formData.mobile}</p>
                  </div>

                  {/* Card Body - Details */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="flex gap-3 items-center p-3 rounded-xl bg-white/40 border border-emerald-900/5 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-emerald-800 bg-emerald-100/60 p-2 rounded-lg text-lg">medical_services</span>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Treatment</p>
                          <p className="font-serif font-bold text-sm text-emerald-950 mt-0.5 truncate">{selectedTreatment}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center p-3 rounded-xl bg-white/40 border border-emerald-900/5 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-emerald-800 bg-emerald-100/60 p-2 rounded-lg text-lg">location_on</span>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Location</p>
                          <p className="font-serif font-bold text-sm text-emerald-950 mt-0.5 truncate">Varanasi Clinic</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center p-3 rounded-xl bg-white/40 border border-emerald-900/5 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-emerald-800 bg-emerald-100/60 p-2 rounded-lg text-lg">calendar_today</span>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Date</p>
                          <p className="font-serif font-bold text-sm text-emerald-950 mt-0.5 truncate">{selectedDate}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center p-3 rounded-xl bg-white/40 border border-emerald-900/5 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-emerald-800 bg-emerald-100/60 p-2 rounded-lg text-lg">schedule</span>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Time</p>
                          <p className="font-serif font-bold text-sm text-emerald-950 mt-0.5 truncate">{selectedTime}</p>
                        </div>
                      </div>

                    </div>

                    {formData.concern && (
                      <div className="p-3 rounded-xl bg-white/40 border border-emerald-900/5 backdrop-blur-sm">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Clinical Concern</p>
                        <p className="text-xs text-neutral-600 italic line-clamp-2">"{formData.concern}"</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button onClick={() => setStep(4)} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 hover:text-emerald-950 hover:underline transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-[13px]">edit</span> Edit Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Payment summary / Action - 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card bg-white/70 border border-white rounded-[32px] p-6 shadow-2xl shadow-emerald-950/5 space-y-4">
                    <h3 className="font-serif text-lg font-bold text-emerald-950 border-b border-emerald-900/5 pb-3">Payment Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Consultation Deposit</span>
                        <span className="font-semibold text-neutral-800">₹50.00</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">GST / Taxes</span>
                        <span className="text-neutral-400 italic">Inclusive</span>
                      </div>
                      <div className="h-px bg-emerald-900/5 my-1" />
                      <div className="flex justify-between items-baseline">
                        <span className="font-serif font-bold text-sm text-emerald-950">Total Amount</span>
                        <span className="font-serif font-extrabold text-xl text-emerald-950">₹50.00</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button onClick={handleCompleteBooking} className="w-full bg-emerald-950 text-white hover:bg-emerald-900 py-4 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">shield</span> SECURE & DEPOSIT
                      </button>
                    </div>

                    <p className="text-[9px] text-neutral-400 text-center leading-relaxed font-medium">
                      By proceeding, you agree to secure your booking with a ₹50 refundable consultation deposit. Transactions are fully encrypted and secure.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center py-6 md:py-16 space-y-10">
              <div className="flex justify-center"><div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-900 text-white rounded-full flex items-center justify-center animate-pulse shadow-2xl"><CheckCircle2 size={48} /></div></div>
              <div className="space-y-4">
                <h1 className="font-serif text-3xl md:text-7xl font-bold text-emerald-950 tracking-tighter">Clinical Success</h1>
                <p className="text-emerald-900/50 text-[11px] md:text-xs font-medium tracking-wide max-w-sm mx-auto leading-relaxed px-4">Your diagnostic slot is now locked. Dr. Megha's office will synchronize with your profile shortly.</p>
              </div>
              <button onClick={triggerReset} className="bg-emerald-950 text-white py-4 md:py-5 px-10 md:px-14 rounded-full font-bold text-[9px] md:text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all">Return to Sanctuary</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-20 border-t border-emerald-950/5 text-center opacity-30 select-none">
        <p className="font-serif text-2xl font-bold tracking-tighter text-emerald-950 mb-2">DERMELIXIR</p>
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Private Aesthetics Node &bull; Varanasi 2026</p>
      </footer>
    </div>
  );
};

const X = ({ size }: { size: number }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>close</span>;
const ChevronLeft = ({ size }: { size: number }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>chevron_left</span>;
const ChevronRight = ({ size }: { size: number }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>chevron_right</span>;
const CheckCircle2 = ({ size }: { size: number }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>check_circle</span>;
