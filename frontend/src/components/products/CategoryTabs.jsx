import { cn } from '@/lib/cn';

/** "All" + active categories that have products. Horizontally scrollable on mobile. */
export default function CategoryTabs({ categories, active, onChange }) {
  const tabs = [{ slug: '', name: 'All' }, ...categories.filter((c) => c.productCount > 0)];

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" aria-label="Product categories" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {tabs.map((t) => {
          const selected = (active || '') === t.slug;
          return (
            <button
              key={t.slug || 'all'}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(t.slug)}
              className={cn(
                'inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full border px-5 text-sm font-semibold transition-colors',
                selected ? 'border-primary bg-primary text-white' : 'border-border bg-white text-primary hover:border-primary-300 hover:bg-muted',
              )}
            >
              {t.name}
              {t.productCount !== undefined && (
                <span className={cn('rounded-full px-2 py-0.5 text-xs', selected ? 'bg-white/15' : 'bg-muted text-ink-muted')}>{t.productCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
