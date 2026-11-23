import { Navigate, useLocation } from 'react-router-dom';
import PageLoader from '@/components/common/PageLoader';
import { ROUTES } from '@/lib/constants';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageLoader fullScreen />;
  if (status === 'unauthenticated') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTES.admin.login}?next=${next}`} replace />;
  }
  return children;
}
