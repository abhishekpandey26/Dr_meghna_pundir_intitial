const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Allow FRONTEND_URL, but in local development/testing, also allow any localhost port to prevent CORS blocks
// Support comma-separated URLs and strip trailing slashes for robustness
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    // Allow local development origins
    if (cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // Check direct match
    if (allowedOrigins.indexOf(cleanOrigin) !== -1) {
      return callback(null, true);
    }

    // Support automatic matching for www vs non-www su b[domains
    let isAllowed = false;
    try {
      const originUrl = new URL(cleanOrigin);
      isAllowed = allowedOrigins.some(allowedUrl => {
        try {
          const allowed = new URL(allowedUrl);
          if (allowed.protocol !== originUrl.protocol) return false;
          
          const allowedHost = allowed.hostname.replace(/^www\./, '');
          const originHost = originUrl.hostname.replace(/^www\./, '');
          return allowedHost === originHost;
        } catch {
          return allowedUrl === cleanOrigin;
        }
      });
    } catch (e) {
      // Fallback in case origin is not a valid URL structure
      isAllowed = allowedOrigins.includes(cleanOrigin);
    }

    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked] Origin "${origin}" is not allowed. Configured FRONTEND_URL: "${process.env.FRONTEND_URL || ''}" (Parsed: ${JSON.stringify(allowedOrigins)})`);
    callback(new Error('Not allowed by CORS'));
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

app.listen(PORT, () => {
  console.log(`🚀 Server navigating at http://localhost:${PORT}`);
});
