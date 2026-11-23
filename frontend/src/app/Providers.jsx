import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';

/** AuthProvider lives in the lazy admin bundle (admin/AdminRoot) so visitors never download it. */
export default function Providers({ children }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </HelmetProvider>
  );
}
