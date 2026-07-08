/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp, AppView } from './context/AppContext';
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

import { motion, useScroll, useSpring } from 'framer-motion';

function ViewDispatcher() {
  const { view, isAuthenticated, setView } = useApp();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Initial URL Routing Logic
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as AppView;

      // Priority 1: Path based (/admin/login)
      if (path === '/admin/login') {
        if (!isAuthenticated) {
          setView('admin-login');
        } else {
          setView('admin');
        }
        // Clean up URL to standard SPA format
        window.history.replaceState({}, '', '/?view=' + (isAuthenticated ? 'admin' : 'admin-login'));
        return;
      }

      // Priority 2: Query param based (?view=admin)
      if (viewParam && ['landing', 'booking', 'admin', 'admin-login', 'skin-analyzer', 'video-room', 'patient-portal', 'blog-detail', 'testimonials', 'about', 'gallery'].includes(viewParam)) {
        if (viewParam !== view) {
          if (!isAuthenticated && (viewParam === 'admin' || viewParam === 'admin-login')) {
            setView('admin-login');
          } else if (isAuthenticated && viewParam === 'admin-login') {
            setView('admin');
          } else {
            const slug = params.get('slug') || undefined;
            setView(viewParam, slug);
          }
        }
      } else if (!viewParam && view !== 'landing') {
        setView('landing');
      }
    };

    handleUrlRouting();
    // Also listen for back/forward events
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [isAuthenticated, setView, view]);

  // Scroll to top on every view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  const isAdminArea = view === 'admin' || view === 'admin-login';

  if (view === 'admin' && !isAuthenticated) {
    return <AdminLogin />;
  }

  if (view === 'admin-login' && isAuthenticated) {
    return <AdminView />;
  }

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
      {!isAdminArea && (
        <ChatAgent onStartBooking={() => setView('booking')} />
      )}
      <div className={isAdminArea ? '' : 'overflow-x-hidden'}>
        {(() => {
          switch (view) {
            case 'skin-analyzer':
              return <SkinAnalyzer />;
            case 'admin':
              return <AdminView />;
            case 'admin-login':
              return <AdminLogin />;
            case 'video-room':
              return <VideoRoom />;
            case 'patient-portal':
              return <PatientPortal />;
            case 'blog-detail':
              return <BlogDetailView />;
            case 'testimonials':
              return <TestimonialsView />;
            case 'about':
              return <AboutView />;
            case 'gallery':
              return <GalleryView />;
            case 'booking':
            case 'landing':
            default:
              return <LandingView />;
          }
        })()}
      </div>
      {view === 'booking' && <BookingView />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ViewDispatcher />
    </AppProvider>
  );
}

///now what you have to create a backend for this frontend ok see what are the api we need when w