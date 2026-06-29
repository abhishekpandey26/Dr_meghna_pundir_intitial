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

function ViewDispatcher() {
  const { view, isAuthenticated, setView } = useApp();

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
      if (viewParam && ['landing', 'booking', 'admin', 'admin-login', 'skin-analyzer', 'video-room', 'patient-portal', 'blog-detail'].includes(viewParam)) {
        if (!isAuthenticated && (viewParam === 'admin' || viewParam === 'admin-login')) {
          setView('admin-login');
        } else if (isAuthenticated && viewParam === 'admin-login') {
          setView('admin');
        } else {
          const slug = params.get('slug') || undefined;
          setView(viewParam, slug);
        }
      }
    };

    handleUrlRouting();
    // Also listen for back/forward events
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [isAuthenticated, setView]);

  const isAdminArea = view === 'admin' || view === 'admin-login';

  if (view === 'admin' && !isAuthenticated) {
    return <AdminLogin />;
  }

  if (view === 'admin-login' && isAuthenticated) {
    return <AdminView />;
  }

  return (
    <>
      {!isAdminArea && (
        <ChatAgent onStartBooking={() => setView('booking')} />
      )}
      <div className={isAdminArea ? '' : 'overflow-x-hidden'}>
        {(() => {
          switch (view) {
            case 'booking':
              return <BookingView />;
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
            case 'landing':
            default:
              return <LandingView />;
          }
        })()}
      </div>
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