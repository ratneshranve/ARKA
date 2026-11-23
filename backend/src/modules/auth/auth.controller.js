import { ok } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { REFRESH_COOKIE, refreshCookieOptions } from '../../utils/tokens.js';
import * as authService from './auth.service.js';

const setRefreshCookie = (res, token) => res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
const clearRefreshCookie = (res) => {
  const { maxAge: _maxAge, ...opts } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, opts);
};

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, admin } = await authService.login(req.body, req.get('user-agent'));
  setRefreshCookie(res, refreshToken);
  ok(res, { accessToken, admin });
});

export const refresh = asyncHandler(async (req, res) => {
  try {
    const { accessToken, refreshToken, admin } = await authService.refresh(
      req.cookies?.[REFRESH_COOKIE],
      req.get('user-agent'),
    );
    setRefreshCookie(res, refreshToken);
    ok(res, { accessToken, admin });
  } catch (err) {
    clearRefreshCookie(res);
    throw err;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  ok(res, { message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  ok(res, await authService.getProfile(req.admin.id));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ok(res, { message: 'If an account exists for this email, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  clearRefreshCookie(res);
  ok(res, { message: 'Password updated. Please log in with your new password.' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const data = await authService.changePassword(req.admin.id, req.body, req.cookies?.[REFRESH_COOKIE]);
  ok(res, { ...data, message: 'Password changed. Other sessions have been logged out.' });
});

export const updateProfile = asyncHandler(async (req, res) => {
  ok(res, await authService.updateProfile(req.admin.id, req.body));
});
