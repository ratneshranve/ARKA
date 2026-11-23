import { Link } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/cn';
import { DEFAULT_LOGO_LIGHT, LOGO_ICON, ROUTES } from '@/lib/constants';

/**
 * Navbar logo: the sun-and-bolt icon only (no text), linking home.
 * `light` renders the full light logo for dark backgrounds (footer) — the uploaded one from Settings if present.
 */
export default function Logo({ light = false, className, onClick }) {
  const { company } = useSettings();
  const name = company.name || 'ARKA Solar Energy';

  if (light) {
    return (
      <Link to={ROUTES.home} onClick={onClick} className={cn('inline-block', className)} aria-label={`${name} — Home`}>
        <img src={company.logoLight?.url || DEFAULT_LOGO_LIGHT} alt={name} width="180" height="152" className="h-28 w-auto" loading="lazy" />
      </Link>
    );
  }

  return (
    <Link to={ROUTES.home} onClick={onClick} className={cn('flex shrink-0 items-center', className)} aria-label={`${name} — Home`}>
      <img src={LOGO_ICON} alt={name} width="509" height="314" className="h-10 w-auto lg:h-12" />
    </Link>
  );
}
