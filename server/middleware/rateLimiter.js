const rateLimitStore = new Map(); // IP -> Array of timestamps

const bookingRateLimiter = (req, res, next) => {
  // Get IP address from various headers or socket
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  let attempts = rateLimitStore.get(ip) || [];

  // Filter out attempts older than 10 minutes
  attempts = attempts.filter(timestamp => now - timestamp < tenMinutes);

  if (attempts.length >= 4) {
    return res.status(429).json({
      error: 'Too many booking attempts. Please try again after 10 minutes to protect slot availability.'
    });
  }

  // Record new attempt
  attempts.push(now);
  rateLimitStore.set(ip, attempts);

  next();
};

module.exports = { bookingRateLimiter };
