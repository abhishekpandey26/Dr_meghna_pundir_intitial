import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  options?: string[];
}

export const ChatAgent: React.FC<{ onStartBooking: (treatment?: string) => void }> = ({ onStartBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to Dermelixir Sanctuary. I am your Clinical Concierge. How may I assist your transformation today?",
      sender: 'bot',
      options: ['Book Appointment', 'View Treatments', 'Clinic Location', 'Speak to Expert']
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    // Only auto-open on Desktop to avoid covering small screens accidentally
    if (!isMobile) {
      const autoOpenTimer = setTimeout(() => {
        setIsOpen(true);
      }, 40000); // 40 seconds
      return () => clearTimeout(autoOpenTimer);
    }
  }, []);

  const handleOptionClick = (option: string) => {
    const userMsg: Message = { id: Date.now().toString(), text: option, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let botResponse: Message = { id: (Date.now() + 1).toString(), text: '', sender: 'bot' };

      if (option === 'Book Appointment') {
        botResponse.text = "Exquisite choice. Our diagnostic slots are curated for personalized care. Would you like to proceed to the reservation portal now?";
        botResponse.options = ['Proceed to Booking', 'Treatment Packages', 'Main Menu'];
      } else if (option === 'Proceed to Booking') {
        setIsOpen(false);
        onStartBooking();
        return;
      } else if (option === 'View Treatments') {
        botResponse.text = "Dr. Megha Singh specializes in US-FDA approved Laser Technologies, Advanced Hair Restoration, and Bespoke Medical Skincare. Which domain interests you?";
        botResponse.options = ['Laser Technology', 'Hair Restoration', 'Acne Therapy', 'Main Menu'];
      } else if (option === 'Laser Technology' || option === 'Hair Restoration' || option === 'Acne Therapy') {
        setIsOpen(false);
        onStartBooking(option);
        return;
      } else if (option === 'Clinic Location') {
        botResponse.text = "We are located at Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi. We are open Mon-Sat, 10:00 AM - 08:00 PM.";
        botResponse.options = ['View on Map', 'Main Menu'];
      } else if (option === 'View on Map') {
        window.open('https://maps.google.com/?q=Gyandeep+Medicare+Hospital+Varanasi', '_blank');
        botResponse.text = "Map coordinates dispatched. Anything else?";
        botResponse.options = ['Main Menu'];
      } else {
        botResponse.text = "I am at your service. How else can I assist in your clinical journey?";
        botResponse.options = ['Book Appointment', 'View Treatments', 'Clinic Location'];
      }

      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <>
      {/* Proactive Invitation Bubble */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 2, duration: 0.5, ease: "easeOut" }}
          className={`fixed bottom-24 z-[100] bg-white/90 backdrop-blur-xl p-4 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/20 whitespace-nowrap hidden md:block
             ${window.innerWidth <= 768 ? 'left-8' : 'right-28'}`}
        >
          <div className="absolute bottom-[-10px] w-5 h-5 bg-white/90 transform rotate-45 border-r border-b border-white/20 hidden md:block
            ${window.innerWidth <= 768 ? 'left-6' : 'right-6'}"
          />
          <h5 className="text-[11px] font-extrabold text-black uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            We're Online!
          </h5>
          <p className="text-[12px] text-neutral-600 font-medium">How may I help you today?</p>
        </motion.div>
      )}

      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10"
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? 'close' : 'chat_bubble'}
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className={`fixed z-[100] bg-white/80 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-white/20 flex flex-col overflow-visible transition-all duration-500
              ${window.innerWidth <= 768
                ? 'bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-[32px] rounded-b-none'
                : 'bottom-28 right-8 w-[380px] h-[650px] max-h-[85vh] rounded-[32px]'
              }`}
          >
            {/* Top-Right Close Button (Outside) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[110]"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            {/* Header */}
            <div className="p-8 bg-black text-white flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-emerald-400">support_agent</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight">Clinical <span className="text-emerald-400">Concierge</span></h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Live Assistant</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-neutral-50/50"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[85%] p-5 rounded-[24px] text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user'
                      ? 'bg-black text-white rounded-tr-none'
                      : 'bg-white/90 backdrop-blur-md border border-white/20 text-neutral-900 rounded-tl-none font-medium'
                      }`}
                  >
                    {msg.text}
                  </motion.div>

                  {msg.sender === 'bot' && msg.options && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {msg.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleOptionClick(opt)}
                          className="bg-white border border-black/10 text-neutral-900 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 p-4">
                  <span className="w-1.5 h-1.5 bg-emerald-900/20 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-900/20 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-emerald-900/20 rounded-full animate-bounce delay-200" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/20 backdrop-blur-md border-t border-white/10 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/30">
                &copy; Dermelixir Virtual Sanctuary Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
