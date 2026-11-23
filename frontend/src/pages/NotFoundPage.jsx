import { Home, PackageSearch } from 'lucide-react';
import Seo from '@/components/common/Seo';
import Button from '@/components/ui/Button';
import { LOGO_ICON, ROUTES } from '@/lib/constants';

export default function NotFoundPage({ title = 'Page not found', admin = false }) {
  return (
    <section className="flex min-h-[60vh] items-center py-16">
      <Seo title={`404 — ${title}`} noindex />
      <div className="container-page text-center">
        <img src={LOGO_ICON} alt="" width="783" height="525" className="mx-auto h-24 w-auto opacity-90" />
        <p className="mt-6 text-6xl font-extrabold text-accent">404</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          The page you are looking for may have been moved, removed or is temporarily unavailable.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {admin ? (
            <Button to={ROUTES.admin.root} variant="secondary">
              <Home className="h-4 w-4" aria-hidden="true" /> Back to Dashboard
            </Button>
          ) : (
            <>
              <Button to={ROUTES.home} variant="secondary">
                <Home className="h-4 w-4" aria-hidden="true" /> Go Home
              </Button>
              <Button to={ROUTES.products}>
                <PackageSearch className="h-4 w-4" aria-hidden="true" /> Browse Products
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
