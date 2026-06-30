import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

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
    patientToken,
    currentPatient,
    loginPatientWithGoogle,
    updatePatientProfile
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
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

  // Calendar month/year navigation state
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  // Available services list matching the project treatments and screen
  const services = [
    { name: 'OPD', desc: 'General out-patient skin and hair diagnostics & consult', price: '500.00' },
    { name: 'Medical Skincare', desc: 'Bespoke medical aesthetic solutions for flawless skin', price: '500.00' },
    { name: 'Laser Technology', desc: 'US-FDA approved laser therapies calibrated precisely', price: '500.00' },
    { name: 'Hair Restoration', desc: 'Scalp revitalization using advanced growth factors', price: '500.00' }
  ];

  // Sync selected treatment from context or set to first step
  useEffect(() => {
    if (initialTreatment) {
      setSelectedTreatment(initialTreatment);
      setStep(2);
    } else {
      setStep(1);
    }
  }, [initialTreatment]);

  // Pre-populate formData from currentPatient profile details
  useEffect(() => {
    if (currentPatient) {
      const parts = (currentPatient.name || '').trim().split(/\s+/);
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';
      setFirstName(fName);
      setLastName(lName);
      setFormData(prev => ({
        ...prev,
        name: currentPatient.name || prev.name,
        mobile: currentPatient.mobile || prev.mobile,
        email: currentPatient.email || prev.email,
        age: currentPatient.age ? String(currentPatient.age) : prev.age
      }));
    }
  }, [currentPatient]);

  // Update full name in formData when first or last name changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: `${firstName.trim()} ${lastName.trim()}`.trim()
    }));
  }, [firstName, lastName]);

  // Instamojo Payment Verification on Mount
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

  // Generate Month View Calendar Days
  const calendarDays = useMemo(() => {
    const startFirstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Adjust starting offset: Mon = 0, Sun = 6
    const startOffset = (startFirstDayIndex + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(currentYear, currentMonth, d));
    }
    return days;
  }, [currentMonth, currentYear]);

  const monthYearString = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const formatDateKey = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day < 10 ? '0' + day : day}`;
  };

  const getDisplayDate = (dateKey: string) => {
    if (!dateKey) return '';
    const parts = dateKey.split(' ');
    const monthMap: { [key: string]: string } = {
      Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
      Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December'
    };
    const fullMonth = monthMap[parts[0]] || parts[0];
    const dayNum = parseInt(parts[1], 10);
    return `${fullMonth} ${dayNum}`;
  };

  // Generate Slots
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

    // Skip to Step 4 if user profile is already complete
    const isProfileComplete = currentPatient &&
      currentPatient.name &&
      currentPatient.mobile &&
      currentPatient.email &&
      currentPatient.age;

    if (isProfileComplete) {
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const validateFields = () => {
    const errs: { [key: string]: string } = {};

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      errs.name = 'First and Last name are required';
    } else if (fullName.length < 2) {
      errs.name = 'Name must be at least 2 characters';
    } else if (!/^[A-Za-z\s]+$/.test(fullName)) {
      errs.name = 'Name can only contain letters and spaces';
    }

    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    const ageNum = parseInt(formData.age, 10);
    if (!formData.age) {
      errs.age = 'Age is required';
    } else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      errs.age = 'Enter a valid age between 1 and 120';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAndReview = async () => {
    if (validateFields()) {
      setFormErrors('');
      try {
        const res = await updatePatientProfile(formData.name, formData.mobile, parseInt(formData.age, 10));
        if (res.success) {
          setStep(4);
        } else {
          setFormErrors(res.message || 'Failed to update patient profile.');
        }
      } catch (err) {
        setFormErrors('Failed to connect to profile server.');
      }
    } else {
      setFormErrors('Please correct the validation errors in your profile.');
    }
  };

  const handleCompleteBooking = async () => {
    const res = await initiatePayment({
      date: selectedDate,
      startTime: selectedTime,
      patientData: {
        ...formData,
        patientName: formData.name,
        age: parseInt(formData.age),
        treatment: selectedTreatment
      }
    });
    if (res.success && res.longurl) {
      window.location.href = res.longurl;
    }
  };

  const handleGoogleSignIn = async () => {
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

  const handleCloseModal = () => {
    setSelectedTreatmentForBooking('');
    setView('landing');
  };

  // Helper functions for modal titles/icons based on current step
  const getSidebarIcon = () => {
    if (!patientToken) return 'lock';
    switch (step) {
      case 1: return 'lists';
      case 2: return 'calendar_month';
      case 3: return 'edit_note';
      case 4: return 'fact_check';
      case 5: return 'check_circle';
      default: return 'event';
    }
  };

  const getStepTitle = () => {
    if (!patientToken) return 'Secure Booking';
    switch (step) {
      case 1: return 'Service Selection';
      case 2: return 'Select Date & Time';
      case 3: return 'Enter Your Information';
      case 4: return 'Verify Order Details';
      case 5: return 'Clinical Success';
      default: return 'Booking';
    }
  };

  const getStepDescription = () => {
    if (!patientToken) {
      return 'Please sign in with Google to confirm your diagnostic slot, manage appointments, and access your private health records.';
    }
    switch (step) {
      case 1: return 'Please select a service for which you want to schedule an appointment';
      case 2: return 'Please select date and time for your appointment';
      case 3: return 'Please enter your contact information';
      case 4: return 'Double check your reservation details and click submit button if everything is correct';
      case 5: return 'Your slot has been locked. We look forward to seeing you at our Varanasi Clinic!';
      default: return '';
    }
  };

  const showSummarySidebar = patientToken && (step === 2 || step === 3);

  if (isVerifyingPayment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center space-y-4 max-w-sm w-full border border-neutral-100">
          <div className="w-12 h-12 border-4 border-[#8c3a72] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-serif text-lg font-bold text-neutral-800">Verifying Payment</h3>
          <p className="text-xs text-neutral-500">Checking transaction status, please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6 overflow-y-auto font-sans">
      <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden min-h-[500px] md:min-h-[580px] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Sidebar (Pink) */}
        <div className="md:w-1/3 flex flex-col justify-between p-8 md:p-10 bg-[#faf0f5] text-[#4a2c52] border-r border-[#f3d9ea]/30">
          <div>
            <div className="w-14 h-14 rounded-full bg-[#f3d9ea] flex items-center justify-center mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[#8c3a72] text-2xl">
                {getSidebarIcon()}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#4a2c52] mb-3">
              {getStepTitle()}
            </h2>
            <p className="text-xs text-[#6e4e79] leading-relaxed font-medium">
              {getStepDescription()}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-[#f3d9ea] text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9d7da8] mb-1">Questions?</p>
            <a href="tel:+919453238699" className="text-xs text-[#4a2c52] font-semibold hover:text-[#8c3a72] transition-colors flex items-center justify-center md:justify-start gap-1.5">
              <span className="material-symbols-outlined text-sm">call</span> +91 9453238699
            </a>
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="flex-1 flex flex-col justify-between p-6 md:p-8 relative">
          {/* Close button X */}
          {step !== 5 && (
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 transition-colors p-1.5 rounded-full hover:bg-neutral-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}

          {/* Form / Dynamic Section */}
          <div className="flex-1 flex flex-col justify-center">
            {!patientToken ? (
              // Secure Login Step
              <div className="text-center space-y-6 max-w-sm mx-auto py-10">
                <span className="material-symbols-outlined text-5xl text-[#8c3a72]">lock</span>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-neutral-800">Secure Booking Portal</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Confirm slots instantly and manage your digital consultations safely.
                  </p>
                </div>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full bg-[#8c3a72] text-white hover:bg-[#6c2c58] py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">login</span> Sign In with Google
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {step === 1 && (
                  // Step 1: Service Selection
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6 py-6"
                  >
                    <h3 className="font-serif text-xl font-bold text-neutral-800">Available Services</h3>
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                      {services.map(srv => (
                        <div
                          key={srv.name}
                          onClick={() => {
                            setSelectedTreatment(srv.name);
                            setStep(2);
                          }}
                          className="border border-neutral-100 rounded-2xl p-4 bg-white hover:border-[#8c3a72]/30 hover:bg-[#faf0f5]/20 cursor-pointer transition-all flex justify-between items-center shadow-sm"
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-neutral-800 text-sm">{srv.name}</p>
                            <p className="text-neutral-400 text-[10px]">{srv.desc}</p>
                          </div>
                          <span className="material-symbols-outlined text-neutral-300">chevron_right</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  // Step 2: Date & Time Selection
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6 py-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif text-lg font-bold text-neutral-800">Date & Time Selection</h3>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={handlePrevMonth}
                          className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-all"
                        >
                          <span className="material-symbols-outlined text-base">chevron_left</span>
                        </button>
                        <span className="text-sm font-bold text-neutral-800 px-2 min-w-[120px] text-center">
                          {monthYearString}
                        </span>
                        <button 
                          onClick={handleNextMonth}
                          className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-all"
                        >
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-neutral-400 uppercase py-1">
                          {day}
                        </span>
                      ))}
                      {calendarDays.map((date, idx) => {
                        if (!date) {
                          return <div key={`empty-${idx}`} />;
                        }

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = date < today;
                        const isSunday = date.getDay() === 0;
                        const dateKey = formatDateKey(date);
                        const isBlocked = blockedDates.includes(dateKey);
                        const isSelected = selectedDate === dateKey;
                        const isSelectable = !isPast && !isSunday && !isBlocked;

                        return (
                          <button
                            key={dateKey}
                            disabled={!isSelectable}
                            onClick={() => {
                              setSelectedDate(dateKey);
                              setSelectedTime(''); // Reset time on date change
                            }}
                            className={`relative aspect-square flex flex-col items-center justify-center text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#8c3a72] text-white shadow-md shadow-[#8c3a72]/30 font-bold'
                                : !isSelectable
                                  ? 'text-neutral-200 cursor-not-allowed'
                                  : 'text-neutral-700 hover:bg-[#faf0f5] hover:text-[#8c3a72]'
                            }`}
                          >
                            <span>{date.getDate()}</span>
                            {isSelectable && !isSelected && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.75 bg-[#4ec38a] rounded-full animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Time Slots Area */}
                    {selectedDate && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 animate-in fade-in slide-in-from-top-4 duration-300">
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center mb-3">
                          Pick a slot for <span className="text-[#8c3a72] underline decoration-dotted font-bold">{getDisplayDate(selectedDate)}</span>
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                          {generatedTimeSlots.map(t => {
                            const displayTime = t.toLowerCase();
                            const isTimeSelected = selectedTime === t;
                            return (
                              <button
                                key={t}
                                onClick={() => handleSelectTime(t)}
                                className={`py-2 rounded-xl text-xs font-bold tracking-wider transition-all border cursor-pointer ${
                                  isTimeSelected
                                    ? 'bg-[#8c3a72] text-white border-[#8c3a72] shadow-sm'
                                    : 'bg-[#e3f7eb] text-[#2c6643] border-[#c1ebd0] hover:bg-[#c1ebd0]'
                                }`}
                              >
                                {displayTime}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  // Step 3: Customer Information Form
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5 py-4"
                  >
                    <h3 className="font-serif text-lg font-bold text-neutral-800">Customer Information</h3>
                    
                    {formErrors && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 font-semibold uppercase tracking-wider">
                        {formErrors}
                      </div>
                    )}

                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={e => {
                              setFirstName(e.target.value);
                              if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                            }}
                            className={`w-full bg-white border rounded-xl py-3 px-4 text-xs font-medium text-neutral-800 focus:border-[#8c3a72] transition-all outline-none ${
                              fieldErrors.name ? 'border-rose-300' : 'border-neutral-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={e => {
                              setLastName(e.target.value);
                              if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                            }}
                            className={`w-full bg-white border rounded-xl py-3 px-4 text-xs font-medium text-neutral-800 focus:border-[#8c3a72] transition-all outline-none ${
                              fieldErrors.name ? 'border-rose-300' : 'border-neutral-200'
                            }`}
                          />
                        </div>
                      </div>
                      {fieldErrors.name && (
                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{fieldErrors.name}</p>
                      )}

                      {/* Phone and Age */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1">
                          <div className={`flex rounded-xl border overflow-hidden bg-white focus-within:border-[#8c3a72] transition-all ${
                            fieldErrors.mobile ? 'border-rose-300' : 'border-neutral-200'
                          }`}>
                            <div className="bg-neutral-50 border-r border-neutral-100 px-3 flex items-center gap-1.5 text-xs text-neutral-500 font-semibold select-none">
                              <span className="w-4 h-2.5 bg-neutral-300 rounded-sm inline-block" />
                              <span>+91</span>
                            </div>
                            <input
                              type="tel"
                              placeholder="Mobile Number"
                              value={formData.mobile}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData({ ...formData, mobile: val });
                                if (fieldErrors.mobile) setFieldErrors({ ...fieldErrors, mobile: '' });
                              }}
                              className="flex-1 px-3 py-3 text-xs text-neutral-800 outline-none bg-transparent"
                            />
                          </div>
                          {fieldErrors.mobile && (
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{fieldErrors.mobile}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <input
                            type="number"
                            placeholder="Age"
                            value={formData.age}
                            onChange={e => {
                              setFormData({ ...formData, age: e.target.value });
                              if (fieldErrors.age) setFieldErrors({ ...fieldErrors, age: '' });
                            }}
                            className={`w-full bg-white border rounded-xl py-3 px-4 text-xs font-medium text-neutral-800 focus:border-[#8c3a72] transition-all outline-none ${
                              fieldErrors.age ? 'border-rose-300' : 'border-neutral-200'
                            }`}
                          />
                          {fieldErrors.age && (
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{fieldErrors.age}</p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={e => {
                            setFormData({ ...formData, email: e.target.value });
                            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                          }}
                          className={`w-full bg-white border rounded-xl py-3 px-4 text-xs font-medium text-neutral-800 focus:border-[#8c3a72] transition-all outline-none ${
                            fieldErrors.email ? 'border-rose-300' : 'border-neutral-200'
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{fieldErrors.email}</p>
                        )}
                      </div>

                      {/* Consultation Type */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 ml-1">Consultation Mode</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, consultationType: 'IN_CLINIC' })}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              formData.consultationType === 'IN_CLINIC'
                                ? 'bg-[#8c3a72] text-white border-[#8c3a72] shadow-sm'
                                : 'bg-white border-neutral-100 text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold">In-Clinic Visit</p>
                              <p className={`text-[8px] uppercase tracking-wider mt-0.5 ${formData.consultationType === 'IN_CLINIC' ? 'text-[#fcdbfa]' : 'text-neutral-400'}`}>Physical Varanasi Clinic</p>
                            </div>
                            <span className="material-symbols-outlined text-base">location_on</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, consultationType: 'ONLINE' })}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              formData.consultationType === 'ONLINE'
                                ? 'bg-[#8c3a72] text-white border-[#8c3a72] shadow-sm'
                                : 'bg-white border-neutral-100 text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold">Online Video</p>
                              <p className={`text-[8px] uppercase tracking-wider mt-0.5 ${formData.consultationType === 'ONLINE' ? 'text-[#fcdbfa]' : 'text-neutral-400'}`}>Secure video session</p>
                            </div>
                            <span className="material-symbols-outlined text-base">videocam</span>
                          </button>
                        </div>
                      </div>

                      {/* Add Comments */}
                      <div className="space-y-1">
                        <textarea
                          placeholder="Describe your concerns or add comments..."
                          value={formData.concern}
                          onChange={e => setFormData({ ...formData, concern: e.target.value })}
                          className="w-full bg-white border border-neutral-200 rounded-xl py-3 px-4 text-xs font-medium text-neutral-800 focus:border-[#8c3a72] transition-all outline-none resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  // Step 4: Verify Order Details (Checkout list)
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5 py-4"
                  >
                    <h3 className="font-serif text-lg font-bold text-neutral-800">Verify Order Details</h3>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                      
                      {/* Top banner: service name & date/time */}
                      <div className="bg-[#faf0f5] p-4 rounded-2xl border border-[#f3d9ea]/30 space-y-1">
                        <p className="font-serif text-xl font-bold text-[#4a2c52]">{selectedTreatment}</p>
                        <p className="text-xs text-[#8c3a72] font-semibold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {getDisplayDate(selectedDate)}, {selectedTime.toLowerCase()}
                        </p>
                      </div>

                      {/* Location details */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Location</p>
                        <div className="p-3.5 border border-neutral-100 rounded-xl space-y-1 bg-neutral-50/50">
                          <p className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                            {formData.consultationType === 'ONLINE' ? 'Online Video Consult' : 'Dermelixir Clinic'}
                            <a href="https://maps.app.goo.gl/358y8bHkW6yUjE8u9" target="_blank" rel="noreferrer" className="inline-block text-[#8c3a72]">
                              <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                          </p>
                          <p className="text-[10px] text-neutral-500 leading-relaxed">
                            {formData.consultationType === 'ONLINE' 
                              ? 'A secure tele-health video link will be sent to your email.' 
                              : 'Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi, Uttar Pradesh 221010'}
                          </p>
                        </div>
                      </div>

                      {/* Customer details info */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer</p>
                        <div className="flex items-center gap-3 p-3.5 border border-neutral-100 rounded-xl bg-neutral-50/50">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center text-xs shadow-sm select-none uppercase">
                            {firstName[0] || ''}{lastName[0] || ''}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-neutral-800">{formData.name}</p>
                            <p className="text-[10px] text-neutral-400">{formData.email} &bull; {formData.mobile}</p>
                          </div>
                        </div>
                      </div>

                      {/* Checkout Cost Breakdown */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Cost Breakdown</p>
                        <div className="p-3.5 border border-neutral-100 rounded-xl space-y-2 bg-neutral-50/50">
                          <div className="flex justify-between text-xs text-neutral-600">
                            <span>{selectedTreatment} Consultation</span>
                            <span>₹500.00</span>
                          </div>
                          <div className="h-px bg-neutral-100" />
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-neutral-800">Total Price</span>
                            <span className="font-serif font-extrabold text-base text-neutral-900">₹500.00</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  // Step 5: Success Screen
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 max-w-sm mx-auto py-10"
                  >
                    <div className="w-20 h-20 bg-[#e3f7eb] text-[#2c6643] rounded-full flex items-center justify-center mx-auto shadow-md border border-[#c1ebd0] animate-pulse">
                      <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl font-bold text-neutral-800">Clinical Success!</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Your diagnostic slot is now locked. Dr. Megha's office will synchronize with your profile shortly.
                      </p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="w-full bg-[#8c3a72] text-white hover:bg-[#6c2c58] py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer"
                    >
                      Return to Sanctuary
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Navigation Bottom Footer */}
          {patientToken && step !== 5 && (
            <div className="flex justify-between items-center border-t border-neutral-100 pt-5 mt-4">
              <div>
                {step > 1 && (
                  <button
                    onClick={() => {
                      if (step === 2 && !initialTreatment) {
                        setStep(1);
                      } else {
                        setStep(step - 1);
                      }
                      setFormErrors('');
                    }}
                    className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-700 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                  </button>
                )}
              </div>
              
              <div>
                {step === 3 ? (
                  <button
                    onClick={validateAndReview}
                    className="bg-[#8c3a72] text-white hover:bg-[#6c2c58] py-3 px-6 rounded-xl flex items-center gap-1.5 font-bold transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] text-xs uppercase tracking-wider"
                  >
                    Next <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ) : step === 4 ? (
                  <button
                    onClick={handleCompleteBooking}
                    className="bg-[#8c3a72] text-white hover:bg-[#6c2c58] py-3 px-6 rounded-xl flex items-center gap-1.5 font-bold transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] text-xs uppercase tracking-wider"
                  >
                    Submit <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Sidebar (Steps 2 and 3 only) */}
        {showSummarySidebar && (
          <div className="md:w-1/4 border-l border-neutral-100 p-6 flex flex-col justify-between bg-white min-w-[220px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Summary</h3>
              
              <div className="space-y-3.5">
                <p className="font-serif text-base font-bold text-neutral-800 leading-tight">
                  {selectedTreatment || 'Service Selected'}
                </p>
                
                {selectedDate && (
                  <p className="text-[11px] text-[#8c3a72] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    {getDisplayDate(selectedDate)}
                    {selectedTime && `, ${selectedTime.toLowerCase()}`}
                  </p>
                )}
                
                <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  <span className="truncate">
                    {formData.consultationType === 'ONLINE' ? 'Online Video' : 'Dermelixir Clinic'}
                  </span>
                  <a href="https://maps.app.goo.gl/358y8bHkW6yUjE8u9" target="_blank" rel="noreferrer" className="text-[#8c3a72] inline-flex">
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-5">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Cost Breakdown</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span className="truncate max-w-[120px] inline-block">{selectedTreatment || 'Service'}</span>
                  <span>₹500.00</span>
                </div>
                <div className="h-px bg-neutral-100 my-1" />
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-neutral-800">Total Price</span>
                  <span className="font-serif font-extrabold text-base text-neutral-900">₹500.00</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
