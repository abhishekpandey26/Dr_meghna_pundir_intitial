import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

type ScanScreen = 'intro' | 'questions' | 'capture' | 'scanning' | 'details' | 'results';

export const SkinAnalyzer: React.FC = () => {
  const { setView, submitSkinLead, setSelectedTreatmentForBooking } = useApp();

  const [screen, setScreen] = useState<ScanScreen>('intro');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Questionnaire State
  const [skinType, setSkinType] = useState<string>('Combination');
  const [sunExposure, setSunExposure] = useState<string>('Moderate');
  const [primaryConcern, setPrimaryConcern] = useState<string>('Acne');
  
  // Lead Details State
  const [leadForm, setLeadForm] = useState({ name: '', email: '', mobile: '', age: '25' });
  const [formError, setFormError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Scan Results State (randomized for simulation but guided by questionnaire)
  const [scanScores, setScanScores] = useState({
    overallScore: 82,
    hydration: 75,
    redness: 80,
    pores: 85,
    spots: 78
  });

  // Recommended Treatment mapping
  const [recommendedTreatment, setRecommendedTreatment] = useState<string>('Medical Consult');

  // Camera references
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Scanning animation states
  const [scanStatus, setScanStatus] = useState('Initializing dermal scanners...');

  // Start video camera stream
  const startCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError(true);
      setCameraActive(false);
    }
  };

  // Stop video camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror image for natural camera view
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        setScreen('scanning');
      }
    }
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const blobUrl = URL.createObjectURL(file);
      setCapturedImage(blobUrl);
      stopCamera();
      setScreen('scanning');
    }
  };

  // Run scanning animation sequence
  useEffect(() => {
    if (screen === 'scanning') {
      const statuses = [
        'Mapping facial symmetry coordinates...',
        'Analyzing epidermal moisture threshold...',
        'Scanning melanin distribution severity...',
        'Measuring subcutaneous inflammation levels...',
        'Computing final clinical dermatology index...'
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < statuses.length - 1) {
          index++;
          setScanStatus(statuses[index]);
        } else {
          clearInterval(interval);
          
          // Generate final analysis scores guided slightly by concern
          let hydration = Math.floor(Math.random() * 25) + 60; // 60-85
          let redness = Math.floor(Math.random() * 25) + 65;   // 65-90
          let pores = Math.floor(Math.random() * 25) + 60;     // 60-85
          let spots = Math.floor(Math.random() * 25) + 65;     // 65-90

          let treatment = 'Medical Consult';

          if (primaryConcern === 'Acne') {
            pores = Math.floor(Math.random() * 15) + 40; // poor pore score
            redness = Math.floor(Math.random() * 15) + 45; // high redness
            treatment = 'Acne Therapy';
          } else if (primaryConcern === 'Spots' || primaryConcern === 'Pigmentation') {
            spots = Math.floor(Math.random() * 15) + 40; // high spot score
            treatment = 'Laser Resurfacing';
          } else if (primaryConcern === 'Hair') {
            treatment = 'Hair Restoration';
          }

          const overall = Math.floor((hydration + redness + pores + spots) / 4);

          setScanScores({ overallScore: overall, hydration, redness, pores, spots });
          setRecommendedTreatment(treatment);
          setScreen('details');
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [screen, primaryConcern]);

  const handleLeadSubmit = async () => {
    const errs: { [key: string]: string } = {};

    // Name validation
    if (!leadForm.name.trim()) {
      errs.name = 'Patient name is required';
    } else if (leadForm.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    } else if (!/^[A-Za-z\s]+$/.test(leadForm.name.trim())) {
      errs.name = 'Name can only contain letters and spaces';
    }

    // Phone validation
    if (!leadForm.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(leadForm.mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }

    // Email validation
    if (!leadForm.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadForm.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    // Age validation
    const ageNum = parseInt(leadForm.age, 10);
    if (!leadForm.age) {
      errs.age = 'Age is required';
    } else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      errs.age = 'Enter a valid age between 1 and 120';
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      return setFormError('Please correct the validation errors in your profile.');
    }
    setFormError('');

    try {
      await submitSkinLead({
        name: leadForm.name,
        email: leadForm.email,
        mobile: leadForm.mobile,
        age: parseInt(leadForm.age) || undefined,
        skinType,
        scanResults: scanScores,
        primaryConcern
      });
      setScreen('results');
    } catch (err) {
      setFormError('Failed to synchronize scanning lead.');
    }
  };

  const handleBookWithTreatment = () => {
    setSelectedTreatmentForBooking(recommendedTreatment);
    setView('booking');
  };

  const resetAnalyzer = () => {
    setCapturedImage(null);
    setScreen('intro');
    setLeadForm({ name: '', email: '', mobile: '', age: '25' });
    setFieldErrors({});
    setFormError('');
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--blush)', color: 'var(--ink)' }}>
      {/* Top Bar Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-20 h-20 flex items-center justify-between"
        style={{ background: 'rgba(255,249,240,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={() => setView('landing')} className="font-serif text-2xl font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>Derm Elixir</button>
        <button onClick={() => setView('landing')} className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 transition-all cursor-pointer" style={{ color: 'var(--muted)' }}>
          <span className="material-symbols-outlined text-sm">close</span> Close Scan
        </button>
      </nav>

      <main className="pt-24 pb-20 px-4 md:px-6 flex flex-col justify-center items-center min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl text-center space-y-8">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full"
                style={{ color: 'var(--terracotta-dark)', background: 'rgba(184,103,79,0.1)', border: '1px solid rgba(184,103,79,0.2)' }}
              >Clinical AI Diagnostic</span>
              <h1 className="font-serif text-4xl md:text-[52px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>AI Skin Analysis</h1>
              <p className="text-sm md:text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
                Scan your face to receive a detailed dermis health report analyzing spots, redness, pores, and hydration levels, with direct clinical recommendations.
              </p>

              <div className="p-6 bg-white rounded-2xl shadow-sm flex gap-4 text-left max-w-md mx-auto items-start" style={{ border: '1px solid var(--border)' }}>
                <span className="material-symbols-outlined p-2.5 rounded-xl" style={{ color: 'var(--gold-accent)', background: 'rgba(201,160,92,0.1)' }}>shield_with_heart</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--ink)' }}>Patient Privacy Guaranteed</h4>
                  <p className="text-[10px] font-medium leading-relaxed uppercase" style={{ color: 'var(--muted)' }}>
                    Your photos exist only locally in the browser's temporary memory. We do not save or upload your picture.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setScreen('questions')}
                  className="text-white py-4 px-12 rounded-full font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                  style={{ background: 'var(--terracotta)' }}
                >
                  Start Consultation Scan
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: QUESTIONNAIRE */}
          {screen === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-2xl w-full">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-neutral-800 mb-8 tracking-tighter">Your Skin Context</h2>
              <div className="glass-card bg-white/60 p-8 rounded-[32px] border border-white shadow-xl space-y-6">
                
                {/* Skin Type selector */}
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold tracking-[0.3em] text-neutral-400 ml-2">Skin Texture Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Dry', 'Oily', 'Combination', 'Sensitive'].map(t => (
                      <button key={t} onClick={() => setSkinType(t)} className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${skinType === t ? 'bg-[#8A256E] text-white' : 'bg-white/40 border border-neutral-100 text-neutral-600 hover:bg-neutral-50'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Primary Concern selector */}
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold tracking-[0.3em] text-neutral-400 ml-2">Primary Skin Obstacle</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Acne', 'Spots', 'Redness', 'Hair'].map(t => (
                      <button key={t} onClick={() => setPrimaryConcern(t)} className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${primaryConcern === t ? 'bg-[#8A256E] text-white' : 'bg-white/40 border border-neutral-100 text-neutral-600 hover:bg-neutral-50'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Sun Exposure selector */}
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold tracking-[0.3em] text-neutral-400 ml-2">Daily Sun Exposure</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Low', 'Moderate', 'High'].map(t => (
                      <button key={t} onClick={() => setSunExposure(t)} className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${sunExposure === t ? 'bg-[#8A256E] text-white' : 'bg-white/40 border border-neutral-100 text-neutral-600 hover:bg-neutral-50'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setScreen('intro')} className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-[#8A256E] transition-all underline">← Back</button>
                  <button onClick={() => { setScreen('capture'); startCamera(); }} className="bg-[#8A256E] text-white py-3.5 px-8 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-[#721F5B] transition-all cursor-pointer">Proceed to Camera</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: CAPTURE PHOTO */}
          {screen === 'capture' && (
            <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl w-full text-center space-y-6">
              <h2 className="font-serif text-3xl font-bold text-neutral-800 tracking-tighter">Scan Facial Dermis</h2>
              
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-neutral-950">
                {!cameraError && (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}

                {/* Camera Overlay Frame */}
                <div className="absolute inset-0 border-8 border-transparent pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-80 rounded-[50%] border-2 border-dashed border-white/60 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">Position Face Here</span>
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center text-white space-y-4">
                    <span className="material-symbols-outlined text-5xl text-neutral-400">videocam_off</span>
                    <p className="text-sm font-semibold">Webcam access could not be acquired or is disabled.</p>
                    <p className="text-xs text-neutral-500">Please choose a local photo file to perform the scan.</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                {cameraActive && (
                  <button onClick={capturePhoto} className="bg-[#8A256E] text-white hover:bg-[#721F5B] py-4 px-8 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer">
                    <span className="material-symbols-outlined">photo_camera</span> Take Snapshot
                  </button>
                )}

                <label className="bg-white hover:bg-neutral-50 border border-neutral-200 text-[#8A256E] py-4 px-8 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-sm">
                  <span className="material-symbols-outlined">upload_file</span> Choose Photo File
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="pt-2">
                <button onClick={() => { stopCamera(); setScreen('questions'); }} className="text-neutral-400 text-xs hover:text-[#8A256E] underline font-bold uppercase tracking-wider">Adjust Context</button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: SCANNING LOADING */}
          {screen === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md w-full text-center space-y-8">
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-neutral-900 select-none">
                {capturedImage && (
                  <img src={capturedImage} alt="Scan preview" className="w-full h-full object-cover" />
                )}
                
                {/* Sweep Laser Grid Effect */}
                <div className="absolute inset-0 bg-[#8A256E]/10 pointer-events-none" />
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8A256E] to-transparent shadow-[0_0_15px_rgba(138,37,110,1)] z-10"
                />
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-[#8A256E] rounded-full animate-spin mx-auto" />
                <h3 className="font-serif text-2xl font-bold text-neutral-800">Analyzing Skin Dermis...</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#B8674F] animate-pulse">{scanStatus}</p>
              </div>
            </motion.div>
          )}

          {/* SCREEN 5: LEAD DETAILS FORM */}
          {screen === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
              <div className="text-center mb-6">
                <h3 className="font-serif text-3xl font-bold text-neutral-800 tracking-tighter">Almost Ready</h3>
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Please enter details to calculate scores</p>
              </div>

              <div className="glass-card bg-white/70 border border-white rounded-[32px] p-6 shadow-xl space-y-5">
                {formError && <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-rose-100">{formError}</div>}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.3em] text-neutral-400 ml-2">Patient Legal Name</label>
                    <input 
                      type="text" 
                      value={leadForm.name} 
                      onChange={e => {
                        setLeadForm({...leadForm, name: e.target.value});
                        if (fieldErrors.name) setFieldErrors(prev => ({...prev, name: ''}));
                      }} 
                      className={`w-full bg-white/50 border rounded-2xl py-4 px-6 text-sm font-medium outline-none transition-all ${
                        fieldErrors.name ? 'border-rose-400 focus:border-rose-500' : 'border-purple-200/50'
                      }`} 
                      placeholder="Enter name..." 
                    />
                    {fieldErrors.name && (
                      <p className="text-[10px] text-rose-500 font-bold ml-2 uppercase tracking-wider">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.3em] text-neutral-400 ml-2">Email Address</label>
                    <input 
                      type="email" 
                      value={leadForm.email} 
                      onChange={e => {
                        setLeadForm({...leadForm, email: e.target.value});
                        if (fieldErrors.email) setFieldErrors(prev => ({...prev, email: ''}));
                      }} 
                      className={`w-full bg-white/50 border rounded-2xl py-4 px-6 text-sm font-medium outline-none transition-all ${
                        fieldErrors.email ? 'border-rose-400 focus:border-rose-500' : 'border-purple-200/50'
                      }`} 
                      placeholder="Enter email..." 
                    />
                    {fieldErrors.email && (
                      <p className="text-[10px] text-rose-500 font-bold ml-2 uppercase tracking-wider">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.3em] text-neutral-400 ml-2">Mobile Number</label>
                    <input 
                      type="tel" 
                      value={leadForm.mobile} 
                      onChange={e => {
                        setLeadForm({...leadForm, mobile: e.target.value});
                        if (fieldErrors.mobile) setFieldErrors(prev => ({...prev, mobile: ''}));
                      }} 
                      className={`w-full bg-white/50 border rounded-2xl py-4 px-6 text-sm font-medium outline-none transition-all ${
                        fieldErrors.mobile ? 'border-rose-400 focus:border-rose-500' : 'border-purple-200/50'
                      }`} 
                      placeholder="Enter phone..." 
                    />
                    {fieldErrors.mobile && (
                      <p className="text-[10px] text-rose-500 font-bold ml-2 uppercase tracking-wider">{fieldErrors.mobile}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.3em] text-neutral-400 ml-2">Age</label>
                    <input 
                      type="number" 
                      value={leadForm.age} 
                      onChange={e => {
                        setLeadForm({...leadForm, age: e.target.value});
                        if (fieldErrors.age) setFieldErrors(prev => ({...prev, age: ''}));
                      }} 
                      className={`w-full bg-white/50 border rounded-2xl py-4 px-6 text-sm font-medium outline-none transition-all ${
                        fieldErrors.age ? 'border-rose-400 focus:border-rose-500' : 'border-purple-200/50'
                      }`} 
                    />
                    {fieldErrors.age && (
                      <p className="text-[10px] text-rose-500 font-bold ml-2 uppercase tracking-wider">{fieldErrors.age}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={handleLeadSubmit} className="w-full bg-[#8A256E] text-white hover:bg-[#721F5B] py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg cursor-pointer">
                    Calculate Diagnosis Scores
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 6: RESULTS DASHBOARD */}
          {screen === 'results' && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl w-full px-4 space-y-8">
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#B8674F] bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">Scan Analysis Complete</span>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-neutral-800 mt-3 tracking-tighter">Your Skin Report</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                
                {/* Score Indicators - 3 columns */}
                <div className="lg:col-span-3 glass-card bg-white/70 border border-white rounded-[32px] p-6 shadow-2xl space-y-6">
                  
                  {/* Overall score radial header */}
                  <div className="flex items-center gap-6 p-4 bg-[#8A256E] text-white rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/30 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                    <div className="w-20 h-20 rounded-full border-4 border-purple-300/40 flex items-center justify-center flex-none">
                      <span className="font-serif font-extrabold text-2xl text-purple-200">{scanScores.overallScore}</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-purple-200">Dermal Score Index</p>
                      <h3 className="font-serif text-xl font-bold mt-1">Dermis Health: Satisfactory</h3>
                      <p className="text-[10px] text-purple-100/60 mt-0.5 leading-relaxed font-semibold">Your overall score falls within acceptable medical limits. Mild details require localized dermatology treatment.</p>
                    </div>
                  </div>

                  {/* Individual breakdown sliders */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Diagnostic Metrics</h4>
                    
                    {[
                      { label: 'Hydration Levels', value: scanScores.hydration, lowMsg: 'Dry dermis', highMsg: 'Sufficient moisture' },
                      { label: 'Redness & Sensitivity', value: scanScores.redness, lowMsg: 'Inflammation alert', highMsg: 'Calm dermis' },
                      { label: 'Pore Density', value: scanScores.pores, lowMsg: 'Congested pores', highMsg: 'Refined texture' },
                      { label: 'Spot Clear Index', value: scanScores.spots, lowMsg: 'Mild pigmentation', highMsg: 'Clear tone' }
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-neutral-700">{metric.label}</span>
                          <span className="text-xs font-extrabold text-[#8A256E]">{metric.value}%</span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className={`h-full ${metric.value < 60 ? 'bg-amber-500' : 'bg-[#8A256E]'}`}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                          <span>{metric.lowMsg}</span>
                          <span>{metric.highMsg}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Treatment recommendations - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card bg-white/70 border border-white rounded-[32px] p-6 shadow-2xl space-y-6">
                    <h3 className="font-serif text-lg font-bold text-neutral-800 border-b border-purple-100 pb-3">Clinical Recommendations</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#FAF5F9] border border-purple-100 flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#B8674F] text-xl flex-none">medical_information</span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A256E]">Dr. Megha's Recommendation</p>
                          <p className="font-serif font-bold text-base text-neutral-800 mt-1">{recommendedTreatment}</p>
                          <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                            Based on your primary concern ({primaryConcern}) and scoring analysis, this clinical treatment is recommended to target dermal irregularities.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button onClick={handleBookWithTreatment} className="w-full bg-[#8A256E] text-white hover:bg-[#721F5B] py-4 px-6 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <span className="material-symbols-outlined text-sm">event_available</span> BOOK Slot WITH THIS TREATMENT
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button onClick={resetAnalyzer} className="text-xs font-bold text-neutral-400 hover:text-[#8A256E] underline uppercase tracking-widest">
                        Scan Again
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-purple-100/30 text-center opacity-30 select-none">
        <p className="font-serif text-2xl font-bold tracking-tighter text-neutral-800 mb-2">DERMELIXIR</p>
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Private Aesthetics Node &bull; Varanasi 2026</p>
      </footer>
    </div>
  );
};
