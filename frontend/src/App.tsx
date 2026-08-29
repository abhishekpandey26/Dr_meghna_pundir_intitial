/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider, useApp } from './context/AppContext';

import { LandingView } from './components/LandingView';
import { BookingView } from './components/BookingView';
import { AdminView } from './components/AdminView';
import { AdminLogin } from './components/AdminLogin';
import { ChatAgent } from './components/ChatAgent';
import { SkinAnalyzer } from './components/SkinAnalyzer';
import { VideoRoom } from './components/VideoRoom';
import { PatientPortal } from './components/PatientPortal';
import { BlogDetailView } from './components/BlogDetailView';
import { TestimonialsView } from './components/TestimonialsView';
import { AboutView } from './components/AboutView';
import { GalleryView } from './components/GalleryView';
import { FaqView } from './components/FaqView';
import { TreatmentsView } from './components/TreatmentsView';
import { TreatmentDetailView } from './components/TreatmentDetailView';

import { motion, useScroll, useSpring } from 'framer-motion';
import { initGA, logPageView } from './utils/analytics';

// Initialize Google Analytics
initGA();

// Helper to scroll to top and log page views on route changes
function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    logPageView(location.pathname);
  }, [location]);

  return null;
}

// Protected Route for Admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

// Layout with ChatAgent and Scroll Progress
function AppLayout({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <>
      <motion.div
        style={{
          scaleX,
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: 'var(--rose)',
          transformOrigin: '0%',
          zIndex: 9999
        }}
      />
      {!isAdminArea && <ChatAgent onStartBooking={() => navigate('/booking')} />}
      <div className={isAdminArea ? '' : 'overflow-x-hidden'}>
        {children}
      </div>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <BrowserRouter>
          <RouteChangeTracker />
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingView />} />
              <Route path="/booking" element={<><LandingView /><BookingView /></>} />
              <Route path="/about" element={<AboutView />} />
              <Route path="/gallery" element={<GalleryView />} />
              <Route path="/testimonials" element={<TestimonialsView />} />
              <Route path="/faqs" element={<FaqView />} />
              <Route path="/treatments" element={<TreatmentsView />} />
              <Route path="/treatments/:slug" element={<TreatmentDetailView />} />
              <Route path="/skin-analyzer" element={<SkinAnalyzer />} />
              <Route path="/patient-portal" element={<PatientPortal />} />
              <Route path="/video-room" element={<VideoRoom />} />
              <Route path="/blog/:slug" element={<BlogDetailView />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute><AdminView /></AdminRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppProvider>
    </HelmetProvider>
  );
}

///now what you have to create a backend for this frontend ok see what are the api we need when w