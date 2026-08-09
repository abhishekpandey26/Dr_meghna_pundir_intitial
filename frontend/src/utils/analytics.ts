import ReactGA from 'react-ga4';

/**
 * Initialize Google Analytics
 * Call this once when the application loads.
 */
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (measurementId) {
    ReactGA.initialize(measurementId);
  } else {
    console.warn('Google Analytics Measurement ID is missing. GA will not be initialized.');
  }
};

/**
 * Log a page view
 * Call this whenever the active view/route changes.
 * @param path The path or view name (e.g., '/booking', '/admin')
 */
export const logPageView = (path: string) => {
  if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

/**
 * Log a specific event (optional utility for tracking buttons, interactions, etc.)
 */
export const logEvent = (category: string, action: string, label?: string) => {
  if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
    });
  }
};
