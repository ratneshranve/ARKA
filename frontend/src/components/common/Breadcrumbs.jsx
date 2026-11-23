import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

/** items: [{ label, to? }] — the last item is the current page. */
export default function Breadcrumbs({ items, light = false, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            to="/"
            className={cn('inline-flex items-center gap-1', light ? 'text-primary-100 hover:text-accent-light' : 'text-ink-muted hover:text-primary')}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="inline-flex min-w-0 items-center gap-1.5">
              <ChevronRight className={cn('h-4 w-4 shrink-0', light ? 'text-primary-200' : 'text-primary-300')} aria-hidden="true" />
              {item.to && !last ? (
                <Link to={item.to} className={light ? 'text-primary-100 hover:text-accent-light' : 'text-ink-muted hover:text-primary'}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={cn('truncate font-medium', light ? 'text-white' : 'text-primary')}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
