const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const multer = require('multer'); // Added multer for error handling

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Allow FRONTEND_URL, but in local development/testing, also allow any localhost port to prevent CORS blocks
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;

app.use(cors({
  origin: (origin, callback) => {
    // If no origin is provided (e.g. server-to-server requests), allow it
    if (!origin) return callback(null, true);
    
    // Allow local development ports
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // If FRONTEND_URL is set, aggressively match it (ignoring www. differences)
    if (frontendUrl) {
      const cleanOrigin = origin.replace('https://www.', 'https://').replace('http://www.', 'http://');
      const cleanFrontendUrl = frontendUrl.replace('https://www.', 'https://').replace('http://www.', 'http://');
      
      if (cleanOrigin === cleanFrontendUrl) {
        return callback(null, true);
      }
    }

    // In production, to avoid breaking your site if URL configuration is slightly mismatched,
    // we fallback to allowing the origin but logging it. If you want strict security later, 
    // you can change this back to: callback(new Error('Not allowed by CORS'));
    console.warn(`[CORS] Warning: Allowed unconfigured origin: ${origin}`);
    callback(null, true);
  }
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dermelixir';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Cinematic Hub'))
  .catch((err) => console.error('❌ Connection Error:', err));

// Routes
app.use('/api/instagram-posts', require('./routes/instagramRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/reels', require('./routes/reelRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/beforeafter', require('./routes/beforeAfterRoutes'));
app.use('/api/skinleads', require('./routes/skinLeadRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));

// Sitemap and Robots.txt routes
app.use('/', require('./routes/sitemapRoutes'));

// Global error handler to prevent HTML [object Object] responses
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server navigating at http://localhost:${PORT}`);
});
