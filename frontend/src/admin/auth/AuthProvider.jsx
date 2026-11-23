import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/admin.api';
import { refreshSession } from '@/api/http';
import { ROUTES } from '@/lib/constants';
import { tokenStore } from './tokenStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', admin: null });
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // On load, try to restore the session once from the refresh cookie.
  useEffect(() => {
    let alive = true;
    refreshSession()
      .then((data) => alive && setState({ status: 'authenticated', admin: data.admin }))
      .catch(() => alive && setState({ status: 'unauthenticated', admin: null }));
    return () => {
      alive = false;
    };
  }, []);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    queryClient.removeQueries({ queryKey: ['admin'] });
    setState({ status: 'unauthenticated', admin: null });
  }, [queryClient]);

  // Refresh failed inside the axios interceptor → session expired.
  useEffect(
    () =>
      tokenStore.onLogout(() => {
        clearSession();
        const next = encodeURIComponent(location.pathname + location.search);
        navigate(`${ROUTES.admin.login}?next=${next}&expired=1`, { replace: true });
      }),
    [clearSession, navigate, location.pathname, location.search],
  );

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    tokenStore.set(data.accessToken);
    setState({ status: 'authenticated', admin: data.admin });
    return data.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore — the session is cleared locally either way */
    }
    clearSession();
    navigate(ROUTES.admin.login, { replace: true });
  }, [clearSession, navigate]);

  const updateAdmin = useCallback((admin) => setState((s) => ({ ...s, admin })), []);

  const value = useMemo(() => ({ ...state, login, logout, updateAdmin }), [state, login, logout, updateAdmin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
