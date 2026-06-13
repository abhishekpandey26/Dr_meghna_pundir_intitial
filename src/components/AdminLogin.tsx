import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export const AdminLogin: React.FC = () => {
  const { setView, setIsAuthenticated } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a secure check. 
    // For this demonstration, we'll use a simple password.
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setView('admin');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 selection:bg-primary-container selection:text-on-primary-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10 space-y-2">
          <span className="font-serif text-3xl font-bold tracking-tighter text-primary">DERMELIXIR</span>
          <p className="text-on-surface-variant/70 text-xs font-bold uppercase tracking-[0.2em]">Administrative Portal</p>
        </div>

        <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[32px] border border-outline-variant/30 shadow-2xl">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6 text-center">Doctor Login</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">
                Access Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-surface-container border ${error ? 'border-error animate-shake' : 'border-outline-variant/50'} focus:border-primary focus:ring-1 focus:ring-primary outline-none px-5 py-4 rounded-2xl transition-all text-center tracking-[0.3em] font-bold`}
                  autoFocus
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-error text-[10px] font-bold uppercase tracking-widest text-center mt-2"
                  >
                    Invalid Access Credentials
                  </motion.p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Authorize Access
            </button>
          </form>

          <button
            onClick={() => setView('landing')}
            className="w-full mt-6 text-on-surface-variant/60 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest text-center"
          >
            Return to Homepage
          </button>
        </div>

        <p className="mt-8 text-center text-on-surface-variant/40 text-[10px] uppercase tracking-widest leading-relaxed">
          Authorized personnel only. Access attempt logs are recorded.<br />
          &copy; 2026 Dermelixir Medical Systems
        </p>
      </motion.div>
    </div>
  );
};
