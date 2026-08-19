const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,

  max: 5,

  message: {
    success: false,
    message: "Too many requests. Please try again after 1 minutes.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
