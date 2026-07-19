import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';

export const BookingView: React.FC = () => {
  const {
    setView,
    clinicConfig,
    blockedDates,
    selectedTreatmentForBooking: initialTreatment,
    setSelectedTreatmentForBooking,
    lockSlot,
    initiatePayment,
    verifyPayment,
    addAppointment,
    patientToken,
    currentPatient,
    loginPatientWithGoogle,
    updatePatientProfile
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>(initialTreatment || 'OPD');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CLINIC'>('ONLINE');
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState<boolean>(false);

  // Custom inputs for first/last name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    age: '25',
    concern: '',
    consultationType: 'IN_CLINIC' as 'IN_CLINIC' | 'ONLINE'
  });
  const [formErrors, setFormErrors] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [slotsStatus, setSlotsStatus] = useState<{ time: string; status: 'AVAILABLE' | 'BOOKED' | 'LOCKED' }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const timeSlotSectionRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const formAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the newly revealed time-slot picker into view once a date is chosen,
  // so the user isn't left staring at the calendar wondering where the times went.
  useEffect(() => {
    if (!selectedDate) return;
    const timer = window.setTimeout(() => {
      timeSlotSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [selectedDate]);

  // Every time the wizard advances to a new step, land the user at the top of
  // that step instead of wherever the previous step happened to be scrolled to.
  useEffect(() => {
    modalCardRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    formAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Load slot availability dynamically when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const res = await fetch(`${API_BASE}/slots?date=${encodeURIComponent(selectedDate)}`);
        const data = await res.json();
        if (data && data.slots) {
          setSlotsStatus(data.slots);
        } else {
          setSlotsStatus([]);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
        setSlotsStatus([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  // Load Google reCAPTCHA v3 script dynamically
  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
    const scriptId = 'recaptcha-key-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const getRecaptchaToken = async (): Promise<string> => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

    // Bypass client-side execution for the default dummy site key in dev
    if (siteKey === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI') {
      console.log('reCAPTCHA: Dummy key detected, bypassing client check');
      return 'dummy-token-bypass';
    }

    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        (window as any).grecaptcha.ready(() => {
          (window as any).grecaptcha.execute(siteKey, { action: 'booking' })
            .then((token: string) => resolve(token))
            .catch((err: any) => reject(err));
        });
      } else {
        reject(new Error('reCAPTCHA client script not fully loaded yet.'));
      }
    });
  };

  // Sync first & last name to formData.name
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: `${firstName} ${lastName}`.trim()
    }));
  }, [firstName, lastName]);

  // Pre-populate formData from currentPatient profile details
  useEffect(() => {
    if (currentPatient) {
      const parts = (currentPatient.name || '').trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setFormData(prev => ({
        ...prev,
        name: currentPatient.name || prev.name,
        mobile: currentPatient.mobile || prev.mobile,
        email: currentPatient.email || prev.email,
        age: currentPatient.age ? String(currentPatient.age) : prev.age
      }));
    }
  }, [currentPatient]);

  // Handle callback verification of payments
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
          if (res.success) setStep(5); // Success step
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

  // Helper date formatting: "Jun 30", "Jul 01"
  const formatDateString = (d: Date) => {
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    return `${month} ${dayNum < 10 ? '0' + dayNum : dayNum}`;
  };

  // Calendar logic for displaying monthly grids
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  const daysInGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0-indexed
    const firstDay = new Date(year, month, 1);

    // adjust so Monday is 0, Sunday is 6
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const grid = [];

    // Empty slots before the 1st
    for (let i = 0; i < startOffset; i++) {
      grid.push(null);
    }
    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      grid.push(new Date(year, month, day));
    }
    return grid;
  }, [currentMonth]);

  const isDateSelectable = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    // limit to next 30 days
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 30) return false;

    const formatted = formatDateString(d);
    return !blockedDates.includes(formatted);
  };

  // Pre-generate hours slots
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
    try {
      const res = await lockSlot(selectedDate, time);
      if (res && (res.error || (res.message && res.message.toLowerCase().includes('unavailable')))) {
        alert(res.message || 'This slot is currently unavailable. Please pick another timing.');
        return;
      }
      setSelectedTime(time);
      setStep(3); // Go to step 3 (Customer Details Form)
    } catch (err) {
      console.error('Lock slot failed:', err);
      alert('Connection error. Failed to hold the time slot. Please try again.');
    }
  };

  const validateFields = () => {
    const errs: { [key: string]: string } = {};

    if (!firstName.trim()) {
      errs.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      errs.lastName = 'Last name is required';
    }
    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^\+?\d{8,15}$/.test(formData.mobile.trim().replace(/\s/g, ''))) {
      errs.mobile = 'Enter a valid mobile number';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAndReview = async () => {
    if (validateFields()) {
      setFormErrors('');
      setIsVerifyingCaptcha(true);
      try {
        // 1. Get reCAPTCHA v3 token
        const token = await getRecaptchaToken();

        // 2. Verify server-side
        const captchaRes = await fetch(`${API_BASE}/bookings/verify-captcha`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const captchaData = await captchaRes.json();

        if (!captchaData.success) {
          setFormErrors(captchaData.message || 'Security validation failed. Please try again.');
          setIsVerifyingCaptcha(false);
          return;
        }

        // Proceed to payment method selection directly (no Google login required)
        setStep(4);
      } catch (err) {
        setFormErrors('Security validation failed or network connection error. Please try again.');
      } finally {
        setIsVerifyingCaptcha(false);
      }
    } else {
      setFormErrors('Please correct the validation errors in your profile.');
    }
  };

  const handleCompleteBooking = async () => {
    if (paymentMethod === 'ONLINE') {
      const res = await initiatePayment({
        date: selectedDate, startTime: selectedTime,
        patientData: {
          ...formData,
          patientName: formData.name,
          age: parseInt(formData.age || '25'),
          treatment: selectedTreatment,
          paymentMethod: 'ONLINE'
        }
      });
      if (res.success && res.longurl) {
        window.location.href = res.longurl;
      } else {
        alert(res.error || 'Failed to initiate online payment.');
      }
    } else {
      // Pay at Clinic flow: Skip payment gateway and directly book
      try {
        const res = await addAppointment({
          date: selectedDate,
          time: selectedTime,
          ...formData,
          patientName: formData.name,
          age: parseInt(formData.age || '25'),
          treatment: selectedTreatment,
          paymentMethod: 'CLINIC',
          status: 'PENDING',
          paymentStatus: 'Pending'
        });
        if (res.appointment) {
          setStep(6); // Success Step (Step 6)
        } else {
          alert(res.message || 'Booking confirmation failed.');
        }
      } catch (err) {
        alert('Booking connection failed. Please try again.');
      }
    }
  };

  const triggerReset = () => {
    setStep(1); setView('landing');
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-4 pt-6 md:pt-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        onClick={triggerReset}
        className="absolute inset-0 cursor-pointer"
      />

      <div ref={modalCardRef} className="bg-white w-full max-w-5xl md:rounded-[32px] rounded-t-[28px] overflow-x-hidden overflow-y-auto md:overflow-y-hidden shadow-2xl relative z-10 flex flex-col md:flex-row min-h-[550px] max-h-[94vh] md:max-h-[90vh]">

        {/* Left Branded Side Panel — compact single row on mobile, full showcase on desktop */}
        <div className="w-full md:w-[32%] bg-[#FAF5F9] flex flex-row md:flex-col md:justify-between items-center text-left md:text-center relative border-b md:border-b-0 md:border-r border-purple-100/50 px-5 py-4 md:p-8 gap-3 md:gap-0 flex-shrink-0">
          <div className="flex-1 md:flex-1 flex flex-row md:flex-col items-center md:justify-center gap-3 md:gap-0 md:space-y-6 min-w-0">

            {/* Dynamic Step Graphic Icon */}
            {step === 1 ? (
              <div className="w-10 h-10 md:w-20 md:h-20 flex-shrink-0 bg-purple-100/50 rounded-full flex items-center justify-center md:mb-6">
                <svg className="w-5 h-5 md:w-10 md:h-10 text-[#8A256E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </div>
            ) : step === 2 ? (
              <div className="w-10 h-10 md:w-20 md:h-20 flex-shrink-0 bg-purple-100/50 rounded-full flex items-center justify-center md:mb-6">
                <svg className="w-5 h-5 md:w-10 md:h-10 text-[#8A256E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
              </div>
            ) : step === 3 ? (
              <div className="w-10 h-10 md:w-20 md:h-20 flex-shrink-0 bg-purple-100/50 rounded-full flex items-center justify-center md:mb-6">
                <svg className="w-5 h-5 md:w-10 md:h-10 text-[#8A256E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
            ) : step === 4 ? (
              <div className="w-10 h-10 md:w-20 md:h-20 flex-shrink-0 bg-purple-100/50 rounded-full flex items-center justify-center md:mb-6">
                <span className="material-symbols-outlined text-lg md:text-4xl text-[#8A256E]">payments</span>
              </div>
            ) : (
              <div className="w-10 h-10 md:w-20 md:h-20 flex-shrink-0 bg-purple-100/50 rounded-full flex items-center justify-center md:mb-6">
                <svg className="w-5 h-5 md:w-10 md:h-10 text-[#8A256E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.156 12.156L16.5 16.5m-2.25-1.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            )}

            <div className="md:space-y-2 min-w-0">
              <h2 className="text-sm md:text-xl font-bold text-neutral-800 truncate md:whitespace-normal">
                {step === 1 ? 'Service Selection' :
                  step === 2 ? 'Select Date & Time' :
                    step === 3 ? 'Enter Your Information' :
                      step === 4 ? 'Payment Method' :
                        step === 5 ? 'Verify Order Details' :
                          'Appointment Confirmed'}
              </h2>
              <p className="hidden md:block text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                {step === 1 ? 'Please select a service for which you want to schedule an appointment' :
                  step === 2 ? 'Please select date and time for your appointment' :
                    step === 3 ? 'Please enter your contact information' :
                      step === 4 ? 'Please choose how you would like to pay for your consultation' :
                        step === 5 ? 'Double check your reservation details and click submit button if everything is correct' :
                          'Thank you! Your booking is successfully registered.'}
              </p>
            </div>
          </div>

          <div className="hidden md:block mt-8 space-y-1">
            <p className="text-[10px] font-extrabold uppercase text-neutral-400">Questions?</p>
            <p className="text-xs font-bold text-[#8A256E]">Call +91 9120010762 for help</p>
          </div>
        </div>

        {/* Right Dynamic Pane Container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-visible md:overflow-hidden">

          {/* Main Form Area */}
          <div ref={formAreaRef} className="flex-1 p-5 md:p-8 overflow-visible md:overflow-y-auto md:max-h-[85vh]">

            {/* Header Close button */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
                {step < 6 ? `Step ${step} of 5` : ''}
              </span>
              <button
                onClick={triggerReset}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h3 className="font-bold text-neutral-800 text-lg">Available Services</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'OPD', label: 'OPD' }
                    ].map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedTreatment(service.id);
                          setStep(2);
                        }}
                        className={`w-full text-left p-5 rounded-2xl border transition-all text-xs font-bold ${selectedTreatment === service.id
                          ? 'border-[#8A256E] bg-purple-50/30 text-[#8A256E]'
                          : 'border-neutral-200 hover:border-purple-200 hover:bg-neutral-50/50'
                          }`}
                      >
                        {service.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h3 className="font-bold text-neutral-800 text-lg">Date & Time Selection</h3>

                  {/* Calendar Month Header */}
                  <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-widest">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                      </button>
                      <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  {/* Calendar Day Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-neutral-400 py-1">{dayName}</span>
                    ))}

                    {daysInGrid.map((dateObj, idx) => {
                      if (!dateObj) {
                        return <span key={`empty-${idx}`} />;
                      }

                      const formatted = formatDateString(dateObj);
                      const selectable = isDateSelectable(dateObj);
                      const isPicked = selectedDate === formatted;

                      return (
                        <button
                          key={idx}
                          disabled={!selectable}
                          onClick={() => {
                            setSelectedDate(formatted);
                            setSelectedTime(''); // Reset selected time
                          }}
                          className={`aspect-square flex flex-col items-center justify-center text-xs font-bold transition-all relative ${!selectable
                            ? 'text-neutral-200 cursor-not-allowed'
                            : isPicked
                              ? 'bg-[#8A256E] text-white rounded-full'
                              : 'text-neutral-700 hover:bg-purple-50/50'
                            }`}
                        >
                          <span>{dateObj.getDate()}</span>
                          {/* Green underline for availability indicator */}
                          {selectable && !isPicked && (
                            <div className="absolute bottom-1.5 w-4 h-0.5 bg-emerald-500 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time Slot Picker Under Calendar */}
                  {selectedDate && (
                    <div ref={timeSlotSectionRef} className="space-y-4 pt-4 border-t border-neutral-100 scroll-mt-4">
                      <p className="text-xs font-bold text-neutral-500">Pick a slot for <span className="underline text-[#8A256E]">{selectedDate}</span></p>

                      {isLoadingSlots ? (
                        <div className="text-xs text-neutral-400 font-bold py-4">Loading available times...</div>
                      ) : slotsStatus.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {slotsStatus.map((slot) => {
                            const isBooked = slot.status === 'BOOKED';
                            const isLocked = slot.status === 'LOCKED';
                            const isSlotBlocked = isBooked || isLocked;
                            const active = selectedTime === slot.time;

                            return (
                              <button
                                key={slot.time}
                                disabled={isSlotBlocked}
                                onClick={() => handleSelectTime(slot.time)}
                                className={`py-3 px-2 rounded-xl text-[10px] font-bold tracking-wider transition-all text-center ${isBooked
                                  ? 'bg-neutral-100 text-neutral-400 border border-neutral-200/50 line-through cursor-not-allowed'
                                  : isLocked
                                    ? 'bg-amber-50 text-amber-500 border border-amber-200/50 cursor-not-allowed'
                                    : active
                                      ? 'bg-[#8A256E] text-white'
                                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200/50'
                                  }`}
                              >
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-400 font-bold py-4">No time slots configured.</div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <h3 className="font-bold text-neutral-800 text-lg">Customer Information</h3>

                  {formErrors && (
                    <div className="p-3.5 bg-rose-50 text-rose-800 rounded-xl text-xs font-bold uppercase tracking-wider border border-rose-100">
                      {formErrors}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">First Name</label>
                        <input
                          required type="text" value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-900/5"
                        />
                        {fieldErrors.firstName && <span className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.firstName}</span>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Last Name</label>
                        <input
                          required type="text" value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-900/5"
                        />
                        {fieldErrors.lastName && <span className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.lastName}</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="w-24 bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-3 flex items-center justify-center gap-1.5 text-xs font-bold">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel" required value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          placeholder="81234 56789"
                          className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-900/5"
                        />
                      </div>
                      {fieldErrors.mobile && <span className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.mobile}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
                      <input
                        required type="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Johndoe@gmail.com"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-900/5"
                      />
                      {fieldErrors.email && <span className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.email}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Add Comments</label>
                      <textarea
                        value={formData.concern} onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                        rows={3} placeholder="Please enter comments or skin aspirations..."
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-purple-900/5 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs font-bold text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button
                      onClick={validateAndReview}
                      className="bg-[#8A256E] text-white hover:bg-[#721F5B] py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-900/5 cursor-pointer"
                    >
                      Next <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h3 className="font-bold text-neutral-800 text-lg">Payment Method</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pay Online Card */}
                    <button
                      onClick={() => setPaymentMethod('ONLINE')}
                      className={`w-full text-left p-6 rounded-2xl border transition-all flex flex-col justify-between h-40 ${paymentMethod === 'ONLINE'
                        ? 'border-[#8A256E] bg-purple-50/30 text-[#8A256E]'
                        : 'border-neutral-200 hover:border-purple-200 hover:bg-neutral-50/50'
                        }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="material-symbols-outlined text-3xl">credit_card</span>
                        <input
                          type="radio"
                          checked={paymentMethod === 'ONLINE'}
                          onChange={() => setPaymentMethod('ONLINE')}
                          className="accent-[#8A256E] w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-bold text-neutral-800">Pay Online</p>
                        <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">Secure payment via Instamojo gateway. Immediate confirmation.</p>
                      </div>
                    </button>

                    {/* Pay at Clinic Card */}
                    <button
                      onClick={() => setPaymentMethod('CLINIC')}
                      className={`w-full text-left p-6 rounded-2xl border transition-all flex flex-col justify-between h-40 ${paymentMethod === 'CLINIC'
                        ? 'border-[#8A256E] bg-purple-50/30 text-[#8A256E]'
                        : 'border-neutral-200 hover:border-purple-200 hover:bg-neutral-50/50'
                        }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="material-symbols-outlined text-3xl">payments</span>
                        <input
                          type="radio"
                          checked={paymentMethod === 'CLINIC'}
                          onChange={() => setPaymentMethod('CLINIC')}
                          className="accent-[#8A256E] w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-bold text-neutral-800">Pay at Clinic</p>
                        <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">Pay in person at the clinic counter (Cash, UPI, or Card) before your session.</p>
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-8 border-t border-neutral-100">
                    <button
                      onClick={() => setStep(3)}
                      className="text-xs font-bold text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button
                      onClick={() => setStep(5)}
                      className="bg-[#8A256E] text-white hover:bg-[#721F5B] py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-900/5 cursor-pointer"
                    >
                      Next <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h3 className="font-bold text-neutral-800 text-lg">Verify Order Details</h3>

                  <div className="space-y-6">

                    {/* OPD details header summary */}
                    <div>
                      <h4 className="font-bold text-neutral-900 text-md">{selectedTreatment}</h4>
                      <p className="text-xs text-neutral-400 font-medium mt-1">{selectedDate}, {selectedTime}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-100">

                      {/* Location Detail block */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Location</p>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#8A256E] flex items-center gap-1">
                            Skin Savvy Clinic
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                          </p>
                          <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">
                            Malviya kunj, SHARABH HOSPITAL, B31/13 D-P, Saket Nagar Colony, Lanka, Varanasi, Uttar Pradesh 221005
                          </p>
                        </div>
                      </div>

                      {/* Customer Detail block */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-xs">
                            {firstName.charAt(0)}{lastName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-800 truncate">{formData.name}</p>
                            <p className="text-[10px] text-neutral-400 truncate font-semibold">{formData.email}</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Payment Method details */}
                    <div className="pt-4 border-t border-neutral-100 space-y-2">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Payment Method</p>
                      <div className="flex items-center gap-2">
                        {paymentMethod === 'ONLINE' ? (
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-[#8A256E]">check_circle</span> Paid Online (via Gateway)
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-amber-600">schedule</span> Pay at Clinic (Collect in person)
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-between items-center pt-8 border-t border-neutral-100">
                    <button
                      onClick={() => setStep(4)}
                      className="text-xs font-bold text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button
                      onClick={handleCompleteBooking}
                      className="bg-[#8A256E] text-white hover:bg-[#721F5B] py-3.5 px-8 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-900/10 cursor-pointer"
                    >
                      Submit <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-3xl font-bold text-neutral-900">Success</h3>
                    <p className="text-xs text-neutral-500 max-w-xs leading-relaxed font-semibold">
                      Your appointment has been registered and is now pending verification. We will contact you shortly!
                    </p>
                  </div>
                  <button
                    onClick={triggerReset}
                    className="bg-[#8A256E] text-white py-3 px-8 rounded-full font-bold text-[10px] uppercase tracking-wider hover:bg-[#721F5B] transition-all cursor-pointer"
                  >
                    Return Home
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Summary Column */}
          {step >= 2 && step <= 5 && (
            <div className="w-full md:w-[35%] p-5 md:p-8 bg-white border-t md:border-t-0 md:border-l border-neutral-100 flex flex-col justify-between md:max-h-[85vh] overflow-visible md:overflow-y-auto flex-shrink-0">

              <div className="space-y-4 md:space-y-6">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">Summary</h4>
                  <div className="h-px bg-neutral-100 my-3 border-dashed border-t" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-neutral-800">{selectedTreatment}</p>
                  {selectedDate && (
                    <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wide">
                      {selectedDate} {selectedTime ? `, ${selectedTime}` : ''}
                    </p>
                  )}
                  {step >= 5 && (
                    <p className="text-[10px] text-neutral-400 font-medium">Location: Skin Savvy Clinic</p>
                  )}
                  {step >= 4 && (
                    <p className="text-[10px] font-bold mt-2 text-[#8A256E]">
                      Method: {paymentMethod === 'ONLINE' ? 'Online' : 'At Clinic'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 mt-4 md:pt-6 md:mt-8 border-t border-neutral-100">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Cost Breakdown</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-neutral-600">
                    <span>{selectedTreatment}</span>
                    <span>₹500.00</span>
                  </div>
                  <div className="h-px bg-neutral-100 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-neutral-800">Total Price</span>
                    <span className="text-sm font-extrabold text-neutral-900">₹500.00</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
