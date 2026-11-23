import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { passwordResetEmail } from '../../emails/passwordReset.js';
import { sendMail } from '../../emails/sendMail.js';
import { Admin } from '../../models/Admin.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  generateRefreshToken,
  generateResetToken,
  hashToken,
  parseRefreshToken,
  signAccessToken,
} from '../../utils/tokens.js';
import { getSettings } from '../settings/settings.service.js';

const BCRYPT_COST = 12;
const MAX_SESSIONS = 5;
const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
// Used so a login for an unknown email takes as long as a real one.
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash('timing-equaliser', BCRYPT_COST));

const invalidCredentials = () =>
  ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
const invalidRefresh = () =>
  ApiError.unauthorized('Session expired, please log in again', 'INVALID_REFRESH_TOKEN');

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_COST);

/** Adds a refresh session (keeping at most 5, newest first) and returns the raw token. */
function addSession(admin, userAgent) {
  const { raw, hash, expiresAt } = generateRefreshToken(admin._id);
  const now = Date.now();
  admin.refreshTokens = [
    { tokenHash: hash, expiresAt, userAgent: (userAgent || '').slice(0, 300), createdAt: new Date() },
    ...admin.refreshTokens.filter((t) => t.expiresAt.getTime() > now),
  ].slice(0, MAX_SESSIONS);
  return raw;
}

export async function login({ email, password }, userAgent) {
  const admin = await Admin.findOne({ email }).select('+passwordHash +refreshTokens');
  if (!admin) {
    await bcrypt.compare(password, await getDummyHash());
    throw invalidCredentials();
  }

  if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
    throw invalidCredentials();
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= MAX_FAILED) {
      admin.lockUntil = new Date(Date.now() + LOCK_MS);
      admin.failedLoginAttempts = 0;
      logger.warn({ email }, 'Admin account locked after repeated failed logins');
    }
    await admin.save();
    throw invalidCredentials();
  }

  admin.failedLoginAttempts = 0;
  admin.lockUntil = undefined;
  admin.lastLoginAt = new Date();
  const refreshToken = addSession(admin, userAgent);
  await admin.save();

  return { accessToken: signAccessToken(admin._id), refreshToken, admin: admin.toPublic() };
}

/** Rotates the refresh token. A reused/unknown token for a real admin revokes every session. */
export async function refresh(rawToken, userAgent) {
  const parsed = parseRefreshToken(rawToken);
  if (!parsed) throw invalidRefresh();

  const admin = await Admin.findById(parsed.adminId).select('+refreshTokens');
  if (!admin) throw invalidRefresh();

  const session = admin.refreshTokens.find((t) => t.tokenHash === parsed.hash);
  if (!session) {
    admin.refreshTokens = [];
    await admin.save();
    logger.warn({ adminId: parsed.adminId }, 'Refresh token reuse detected — all sessions revoked');
    throw invalidRefresh();
  }

  admin.refreshTokens = admin.refreshTokens.filter((t) => t.tokenHash !== parsed.hash);
  if (session.expiresAt.getTime() <= Date.now()) {
    await admin.save();
    throw invalidRefresh();
  }

  const refreshToken = addSession(admin, userAgent);
  await admin.save();
  return { accessToken: signAccessToken(admin._id), refreshToken, admin: admin.toPublic() };
}

export async function logout(rawToken) {
  const parsed = parseRefreshToken(rawToken);
  if (!parsed) return;
  await Admin.updateOne({ _id: parsed.adminId }, { $pull: { refreshTokens: { tokenHash: parsed.hash } } });
}

export async function getProfile(adminId) {
  const admin = await Admin.findById(adminId);
  if (!admin) throw ApiError.unauthorized();
  return admin.toPublic();
}

export async function forgotPassword(email) {
  const admin = await Admin.findOne({ email });
  if (!admin) return;

  const { raw, hash } = generateResetToken();
  admin.passwordResetTokenHash = hash;
  admin.passwordResetExpires = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MIN * 60 * 1000);
  await admin.save();

  const resetUrl = `${env.APP_URL}/admin/reset-password?token=${raw}`;
  setImmediate(async () => {
    const settings = await getSettings().catch(() => null);
    await sendMail({ to: admin.email, ...passwordResetEmail({ name: admin.name, resetUrl }, settings) });
  });
}

export async function resetPassword({ token, password }) {
  const admin = await Admin.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +refreshTokens');
  if (!admin) throw ApiError.badRequest('This reset link is invalid or has expired', 'INVALID_RESET_TOKEN');

  admin.passwordHash = await hashPassword(password);
  admin.passwordResetTokenHash = undefined;
  admin.passwordResetExpires = undefined;
  admin.passwordChangedAt = new Date();
  admin.refreshTokens = [];
  admin.failedLoginAttempts = 0;
  admin.lockUntil = undefined;
  await admin.save();
}

/** Changes the password, keeps only the current session and returns a fresh access token. */
export async function changePassword(adminId, { currentPassword, newPassword }, currentRawRefresh) {
  const admin = await Admin.findById(adminId).select('+passwordHash +refreshTokens');
  if (!admin) throw ApiError.unauthorized();

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    throw ApiError.badRequest('Current password is incorrect', 'INVALID_PASSWORD', [
      { path: 'currentPassword', message: 'Current password is incorrect' },
    ]);
  }

  const currentHash = currentRawRefresh ? hashToken(currentRawRefresh) : null;
  admin.passwordHash = await hashPassword(newPassword);
  admin.passwordChangedAt = new Date();
  admin.refreshTokens = admin.refreshTokens.filter((t) => t.tokenHash === currentHash);
  await admin.save();

  return { accessToken: signAccessToken(admin._id) };
}

export async function updateProfile(adminId, { name, email }) {
  const taken = await Admin.exists({ email, _id: { $ne: adminId } });
  if (taken) {
    throw new ApiError(409, 'DUPLICATE', 'This email is already in use', [
      { path: 'email', message: 'This email is already in use' },
    ]);
  }
  const admin = await Admin.findByIdAndUpdate(adminId, { name, email }, { new: true, runValidators: true });
  if (!admin) throw ApiError.unauthorized();
  return admin.toPublic();
}
