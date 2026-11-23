import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export default function FormSection({ title, description, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const showBody = !collapsible || open;

  return (
    <section className="rounded-lg border border-border bg-white shadow-card">
      <header className={cn('px-5 py-4', showBody && 'border-b border-border')}>
        {collapsible ? (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
            <span>
              <span className="block text-base font-bold text-primary">{title}</span>
              {description && <span className="mt-0.5 block text-sm text-ink-muted">{description}</span>}
            </span>
            <ChevronDown className={cn('h-5 w-5 text-ink-muted transition-transform', open && 'rotate-180')} aria-hidden="true" />
          </button>
        ) : (
          <>
            <h3 className="text-base font-bold text-primary">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </>
        )}
      </header>
      {showBody && <div className="space-y-5 p-5">{children}</div>}
    </section>
  );
}
