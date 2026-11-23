import { RouterProvider } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Providers from './Providers';
import { router } from './router';

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  );
}
