import { Helmet } from 'react-helmet-async';
import { DEFAULT_LOGO } from '@/lib/constants';

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-4 py-10">
      <Helmet>
        <title>{`${title} | Admin`}</title>
      </Helmet>
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sun-gradient opacity-25 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand opacity-20 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <img src={DEFAULT_LOGO} alt="ARKA Solar Energy" width="1475" height="300" className="mx-auto mb-6 h-14 w-auto max-w-full" />
        <div className="rounded-2xl border border-border bg-white p-6 shadow-card-hover sm:p-8">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-ink-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
      </div>
    </div>
  );
}
