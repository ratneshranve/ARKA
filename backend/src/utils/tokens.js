import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const REFRESH_COOKIE = 'rt';

export function signAccessToken(adminId) {
  return jwt.sign({ sub: String(adminId) }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
}

export const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

/**
 * Refresh tokens look like `<adminId>.<random>` so that an unknown/reused token
 * can still be traced to its admin for reuse detection. Only the sha256 hash is stored.
 */
export function generateRefreshToken(adminId) {
  const raw = `${adminId}.${crypto.randomBytes(64).toString('hex')}`;
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  return { raw, hash: hashToken(raw), expiresAt };
}

export function parseRefreshToken(raw) {
  if (typeof raw !== 'string') return null;
  const [adminId, secret] = raw.split('.');
  if (!/^[a-f\d]{24}$/i.test(adminId || '') || !secret) return null;
  return { adminId, hash: hashToken(raw) };
}

export const generateResetToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashToken(raw) };
};

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
});
