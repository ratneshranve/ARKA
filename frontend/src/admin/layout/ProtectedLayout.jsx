import ProtectedRoute from '../auth/ProtectedRoute';
import AdminLayout from './AdminLayout';

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  );
}
