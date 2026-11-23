import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const handler = (message) => (_req, res) =>
  res.status(429).json({ success: false, error: { code: 'TOO_MANY_REQUESTS', message } });

const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
};

/** 5 failed attempts per 15 minutes per IP + email. */
export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}:${String(req.body?.email || '').toLowerCase()}`,
  handler: handler('Too many login attempts. Please try again in 15 minutes.'),
});

/** 5 enquiries per 10 minutes per IP. Also used for forgot-password. */
export const formLimiter = rateLimit({
  ...base,
  windowMs: 10 * 60 * 1000,
  limit: 5,
  handler: handler('Too many requests, please try again in a few minutes.'),
});

/** 300 requests per 15 minutes per IP on the whole API. */
export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  handler: handler('Too many requests, please slow down.'),
});
