import axios from 'axios';
import { tokenStore } from '@/admin/auth/tokenStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const http = axios.create({ baseURL, withCredentials: true, timeout: 30000 });

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One shared refresh promise so concurrent 401s trigger a single /auth/refresh call.
let refreshPromise = null;

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        tokenStore.set(res.data.data.accessToken);
        return res.data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const NO_RETRY = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/forgot-password', '/auth/reset-password'];

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const shouldRefresh =
      response?.status === 401 &&
      config &&
      !config._retry &&
      !NO_RETRY.some((path) => config.url?.startsWith(path)) &&
      (config.url?.startsWith('/admin') || config.url?.startsWith('/auth'));

    if (shouldRefresh) {
      config._retry = true;
      try {
        await refreshSession();
        return http(config);
      } catch {
        tokenStore.clear();
        tokenStore.emitLogout();
      }
    }
    return Promise.reject(error);
  },
);

/* ── Error helpers ── */

export const getErrorCode = (err) => err?.response?.data?.error?.code;
export const getErrorStatus = (err) => err?.response?.status;

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.status === 429) return 'Too many requests, please try again in a few minutes.';
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please check your connection and try again.';
  if (!err?.response && err?.request) return 'Could not reach the server. Please check your connection.';
  return err?.response?.data?.error?.message || fallback;
}

/** Maps server validation details onto react-hook-form fields. Returns true if any were applied. */
export function applyServerErrors(err, setError) {
  const details = err?.response?.data?.error?.details;
  if (!Array.isArray(details) || !details.length) return false;
  details.forEach((d, i) => {
    if (d.path) setError(d.path, { type: 'server', message: d.message }, { shouldFocus: i === 0 });
  });
  return true;
}
