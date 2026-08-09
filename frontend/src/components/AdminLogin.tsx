import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

type AuthMode = 'login' | 'forgot-password' | 'reset-password';

export const AdminLogin: React.FC = () => {
  const { setIsAuthenticated } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form fields
  const [email, setEmail] = useState('megha.pundir.singh@gmail.com');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status and feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 8000);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.token) {
          localStorage.setItem('dermelixir_admin_token', data.token);
        }
        setIsAuthenticated(true);
        navigate('/admin');
      } else {
        showError(data.message || 'Invalid administrative credentials');
      }
    } catch (err) {
      console.error(err);
      showError('Failed to connect to security server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/admin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showSuccess('Verification code sent to your email.');
        setMode('reset-password');
      } else {
        showError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      showError('Connection error. Failed to dispatch verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      showError('Please complete all fields.');
      return;
    }

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/admin/verify-otp-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp, newPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showSuccess('Password updated successfully! You can now log in.');
        setMode('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showError(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      console.error(err);
      showError('Failed to verify OTP and reset password.');
    } finally {
      setLoading(false);
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
          {mode === 'login' && (
            <>
              <h2 className="font-serif text-2xl font-bold text-primary mb-6 text-center">Owner Login</h2>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">
                    Owner Email
                  </label>
                  <div className="w-full bg-surface-container/60 border border-outline-variant/30 px-5 py-4 rounded-2xl text-center font-bold text-sm text-[#8A256E] select-none">
                    megha.pundir.singh@gmail.com
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                      Access Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                    >
                      Set/Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-5 py-4 rounded-2xl transition-all text-center tracking-[0.3em] font-bold"
                    required
                    autoFocus
                  />
                </div>

                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-error text-[10px] font-bold uppercase tracking-widest text-center mt-2"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                {successMsg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-primary text-[10px] font-bold uppercase tracking-widest text-center mt-2"
                  >
                    {successMsg}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  {loading ? 'Authorizing...' : 'Authorize Access'}
                </button>
              </form>
            </>
          )}

          {mode === 'forgot-password' && (
            <>
              <h2 className="font-serif text-2xl font-bold text-primary mb-2 text-center">Verify Owner</h2>
              <p className="text-on-surface-variant/70 text-xs text-center mb-6 leading-relaxed">
                An OTP verification code will be sent to the owner's email address to verify identity and allow password creation.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">
                    Owner Email
                  </label>
                  <div className="w-full bg-surface-container/60 border border-outline-variant/30 px-5 py-4 rounded-2xl text-center font-bold text-sm text-[#8A256E] select-none">
                    megha.pundir.singh@gmail.com
                  </div>
                </div>

                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-error text-[10px] font-bold uppercase tracking-widest text-center mt-2"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  {loading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full text-on-surface-variant/60 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest text-center mt-4"
                >
                  Back to Login
                </button>
              </form>
            </>
          )}

          {mode === 'reset-password' && (
            <>
              <h2 className="font-serif text-2xl font-bold text-primary mb-2 text-center">Define Password</h2>
              <p className="text-on-surface-variant/70 text-xs text-center mb-6 leading-relaxed">
                Enter the OTP security code sent to <strong>{email}</strong> and set your new admin access credentials.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-5 py-4 rounded-2xl transition-all font-bold text-base text-center tracking-[0.2em]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-5 py-4 rounded-2xl transition-all text-center tracking-[0.2em] font-bold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-5 py-4 rounded-2xl transition-all text-center tracking-[0.2em] font-bold"
                    required
                  />
                </div>

                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-error text-[10px] font-bold uppercase tracking-widest text-center mt-2"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                {successMsg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-primary text-[10px] font-bold uppercase tracking-widest text-center mt-2"
                  >
                    {successMsg}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                >
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  {loading ? 'Updating Credentials...' : 'Verify & Set Password'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full text-on-surface-variant/60 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest text-center mt-4"
                >
                  Cancel
                </button>
              </form>
            </>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full mt-6 text-on-surface-variant/60 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest text-center border-t border-outline-variant/10 pt-4"
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
