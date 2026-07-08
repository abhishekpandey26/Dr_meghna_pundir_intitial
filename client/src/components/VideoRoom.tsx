import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Send, MessageSquare, ShieldCheck, Activity } from 'lucide-react';

export const VideoRoom: React.FC = () => {
  const { setView } = useApp();
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [cameraAccess, setCameraAccess] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [chatOpen, setChatOpen] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'patient' | 'doctor'; text: string; time: string }>>([
    { sender: 'doctor', text: 'Hello! I am Dr. Megha Singh. I am reviewing your case files now. How can I help you today?', time: 'Just now' }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulated active caller voice wave levels
  const [voiceLevel, setVoiceLevel] = useState<number[]>([10, 20, 15, 30, 45, 20, 10]);

  // Request browser camera stream
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraAccess('granted');
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        setCameraAccess('denied');
      }
    };

    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [cameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Simulate remote caller voice activation waveforms
  useEffect(() => {
    const interval = setInterval(() => {
      setVoiceLevel(Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 5));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Handle sending a message and getting a simulated doctor reply
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMsg = { sender: 'patient' as const, text: inputValue, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');

    // Trigger Doctor reply simulation
    setTimeout(() => {
      let replyText = "I see. Let's examine your skin analyzer metrics. Your scores show a slightly elevated redness rating, so I'll suggest a calming clinical treatment.";
      if (inputValue.toLowerCase().includes('acne') || inputValue.toLowerCase().includes('pimple')) {
        replyText = "For the acne concerns you mentioned, we should look into custom chemical peeling sessions and a modified sebum control routine.";
      } else if (inputValue.toLowerCase().includes('laser') || inputValue.toLowerCase().includes('scar')) {
        replyText = "Rolling acne scars respond exceptionally well to our FDA-approved fractional laser resurfacing. We can schedule a session next week.";
      } else if (inputValue.toLowerCase().includes('hair') || inputValue.toLowerCase().includes('fall')) {
        replyText = "For hair restoration, our growth factor therapy (PRP) targets the roots directly. It usually takes 3-4 sessions for optimal density.";
      }

      setMessages(prev => [...prev, {
        sender: 'doctor',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2500);
  };

  return (
    <div className="bg-[#0b0f17] text-white min-h-screen font-sans flex flex-col relative overflow-hidden">
      
      {/* Header bar */}
      <nav className="h-20 border-b border-white/5 px-6 flex items-center justify-between backdrop-blur-md bg-black/20 z-10">
        <div className="flex items-center gap-3">
          <span className="font-serif text-2xl font-bold tracking-tighter text-emerald-400">DERMELIXIR</span>
          <span className="text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <Activity className="w-3 h-3" /> Live Consultation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">End-to-End Encrypted Link</span>
          </div>
          <button 
            onClick={() => { stopCamera(); setView('landing'); }}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main consultation screen workspace */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* Left side: Video grid (2 columns or responsive stack) */}
        <div className="flex-1 p-6 flex flex-col justify-center items-center gap-6 relative">
          
          <div className="w-full h-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Box 1: Remote Caller (Dr. Megha Singh) */}
            <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-[#131924] flex flex-col justify-center items-center">
              
              {/* Doctor looping cinematic avatar simulation */}
              <div className="absolute inset-0 bg-[#0f141f] flex flex-col items-center justify-center gap-4">
                <div className="relative w-28 h-28 rounded-full border-4 border-emerald-500/30 flex items-center justify-center overflow-hidden bg-emerald-950">
                  <span className="font-serif text-3xl font-bold text-emerald-400">DR</span>
                </div>
                <div className="text-center">
                  <h4 className="font-serif text-lg font-bold text-emerald-100">Dr. Megha Singh</h4>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest mt-1">Dermatologist & Cosmetologist</p>
                </div>

                {/* Simulated dynamic audio level waveform */}
                <div className="flex gap-1 items-end h-8 mt-4">
                  {voiceLevel.map((lvl, idx) => (
                    <motion.div 
                      key={idx} 
                      animate={{ height: lvl }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                      className="w-1.5 bg-emerald-400 rounded-full" 
                    />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5">
                Dr. Megha Singh (Varanasi Clinic)
              </div>
            </div>

            {/* Box 2: Patient Self Feed */}
            <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-[#131924] flex flex-col justify-center items-center">
              
              {cameraActive && cameraAccess === 'granted' ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="absolute inset-0 bg-[#0f141f] flex flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-500">
                    <CameraOff className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Camera Feed Offline</p>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> You (Patient)
              </div>
            </div>

          </div>

          {/* Bottom control hub floating panel */}
          <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-full shadow-2xl backdrop-blur-md">
            <button 
              onClick={() => setMicActive(!micActive)}
              className={`p-4 rounded-full transition-all cursor-pointer ${micActive ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'}`}
            >
              {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setCameraActive(!cameraActive)}
              className={`p-4 rounded-full transition-all cursor-pointer ${cameraActive ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'}`}
            >
              {cameraActive ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => { stopCamera(); setView('landing'); }}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-4 rounded-full transition-all cursor-pointer ${chatOpen ? 'bg-emerald-900/50 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/10' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Right side: Telehealth sidebar console (Score report + Chat widget) */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '380px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-full lg:w-[380px] bg-[#0e121a] border-l border-white/5 flex flex-col flex-shrink-0"
            >
              
              {/* Top half: Diagnostics results report */}
              <div className="p-6 border-b border-white/5 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Dermal Diagnostics File
                </h4>
                
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Overall Skin Health</span>
                    <span className="text-xs font-extrabold text-emerald-400">82/100</span>
                  </div>
                  
                  {/* Metric sliders */}
                  <div className="space-y-2">
                    {[
                      { label: 'Hydration Level', val: 78, color: 'bg-emerald-500' },
                      { label: 'Pores & Oil Metric', val: 84, color: 'bg-emerald-500' },
                      { label: 'Redness & Sensitivity', val: 58, color: 'bg-amber-500' },
                      { label: 'Spot Clear Index', val: 72, color: 'bg-emerald-500' }
                    ].map(met => (
                      <div key={met.label} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-semibold text-neutral-400">
                          <span>{met.label}</span>
                          <span>{met.val}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${met.color}`} style={{ width: `${met.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Bottom half: Chat interface */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Consultation Chat</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                
                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 pr-4 custom-scrollbar">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                        msg.sender === 'patient' 
                          ? 'bg-emerald-900 text-white rounded-tr-none' 
                          : 'bg-white/5 border border-white/5 text-neutral-200 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest mt-1 ml-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Input panel */}
                <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Dr. Megha a question..."
                    className="flex-1 bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-emerald-500 transition-colors placeholder:text-neutral-600"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="p-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};
