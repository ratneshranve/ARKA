import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import Markdown from '@/components/common/Markdown';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import SpecTable from './SpecTable';

/** Description / Specifications / Additional Information — tabs on desktop, accordions on mobile. Empty sections are hidden. */
export default function ProductInfoTabs({ product }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const baseId = useId();

  const sections = [
    product.description && { key: 'description', label: 'Description', content: <Markdown>{product.description}</Markdown> },
    product.specifications?.length > 0 && {
      key: 'specs',
      label: 'Specifications',
      content: <SpecTable rows={product.specifications} caption={`${product.name} specifications`} />,
    },
    product.additionalInfo && { key: 'info', label: 'Additional Information', content: <Markdown>{product.additionalInfo}</Markdown> },
  ].filter(Boolean);

  const [active, setActive] = useState(sections[0]?.key);
  const [openKeys, setOpenKeys] = useState(() => new Set(sections[0] ? [sections[0].key] : []));

  if (!sections.length) return null;

  if (isDesktop) {
    const current = sections.find((s) => s.key === active) ?? sections[0];
    return (
      <div>
        <div role="tablist" aria-label="Product information" className="flex gap-1 border-b border-border">
          {sections.map((s) => (
            <button
              key={s.key}
              id={`${baseId}-tab-${s.key}`}
              type="button"
              role="tab"
              aria-selected={current.key === s.key}
              aria-controls={`${baseId}-panel-${s.key}`}
              onClick={() => setActive(s.key)}
              className={cn(
                '-mb-px min-h-[48px] border-b-2 px-5 text-base font-semibold transition-colors',
                current.key === s.key ? 'border-accent text-primary' : 'border-transparent text-ink-muted hover:text-primary',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div id={`${baseId}-panel-${current.key}`} role="tabpanel" aria-labelledby={`${baseId}-tab-${current.key}`} className="py-6">
          {current.content}
        </div>
      </div>
    );
  }

  const toggle = (key) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-white">
      {sections.map((s) => {
        const open = openKeys.has(s.key);
        return (
          <div key={s.key}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${baseId}-acc-${s.key}`}
                onClick={() => toggle(s.key)}
                className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-base font-semibold text-primary"
              >
                {s.label}
                <ChevronDown className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
              </button>
            </h3>
            {open && (
              <div id={`${baseId}-acc-${s.key}`} className="px-4 pb-5">
                {s.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
