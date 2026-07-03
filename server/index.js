const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
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
