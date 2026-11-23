/**
 * In-memory access token store. The access token is never written to
 * localStorage/sessionStorage; the refresh token lives in an HttpOnly cookie.
 */
let accessToken = null;
const listeners = new Set();

export const tokenStore = {
  get: () => accessToken,
  set: (token) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
  /** Subscribe to forced logouts (refresh failed). Returns an unsubscribe function. */
  onLogout: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emitLogout: () => listeners.forEach((fn) => fn()),
};
