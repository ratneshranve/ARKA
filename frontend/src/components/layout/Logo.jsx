import { Link } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/cn';
import { DEFAULT_LOGO_LIGHT, LOGO_ICON, ROUTES } from '@/lib/constants';

/**
 * Header logo: the uploaded logo from Settings if present, otherwise the sun-and-roof icon
 * with an "ARKA / SOLAR ENERGY" wordmark matching the brand logo.
 * `light` renders the light version for dark backgrounds (footer).
 */
export default function Logo({ light = false, className, onClick }) {
  const { company } = useSettings();
  const uploaded = light ? company.logoLight?.url : company.logo?.url;
  const name = company.name || 'ARKA Solar Energy';

  if (light) {
    return (
      <Link to={ROUTES.home} onClick={onClick} className={cn('inline-block', className)} aria-label={`${name} — Home`}>
        <img src={uploaded || DEFAULT_LOGO_LIGHT} alt={name} width="180" height="152" className="h-28 w-auto" loading="lazy" />
      </Link>
    );
  }

  return (
    <Link to={ROUTES.home} onClick={onClick} className={cn('flex shrink-0 items-center gap-2.5', className)} aria-label={`${name} — Home`}>
      {uploaded ? (
        <img src={uploaded} alt={name} className="h-11 w-auto lg:h-14" width="160" height="56" />
      ) : (
        <>
          <img src={LOGO_ICON} alt="" width="783" height="525" className="h-10 w-auto lg:h-12" aria-hidden="true" />
          <span className="flex flex-col leading-none">
            <span className="text-[22px] font-extrabold tracking-[0.08em] text-primary lg:text-[26px]">ARKA</span>
            <span className="mt-1 flex items-center gap-1 text-[9.5px] font-bold tracking-[0.22em] text-brand lg:text-[10.5px]">
              SOLAR ENERGY
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
