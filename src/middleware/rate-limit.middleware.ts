import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

export const rateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: `You have exceeded the ${maxRequests} requests in ${windowMs / 1000} seconds limit!`,
      retryAfter: Math.ceil(windowMs / 1000),
      timestamp: new Date().toISOString(),
    });
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: 'Too many requests for this operation',
  skipSuccessfulRequests: false,
});