import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';

/** Root of the lazily loaded admin bundle: auth context + noindex for every admin page. */
export default function AdminRoot() {
  return (
    <AuthProvider>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Outlet />
    </AuthProvider>
  );
}
