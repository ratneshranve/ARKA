import { cn } from '@/lib/cn';

/** Eyebrow + heading + optional description + optional action on the right. */
export default function SectionHeading({ eyebrow, title, description, action, align = 'left', as: Tag = 'h2', light, className }) {
  const centered = align === 'center';
  return (
    <div className={cn('mb-8 flex flex-col gap-4 md:mb-10', !centered && action && 'md:flex-row md:items-end md:justify-between', className)}>
      <div className={cn(centered && 'mx-auto max-w-2xl text-center')}>
        {eyebrow && (
          <p className={cn('mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider', light ? 'text-accent-light' : 'text-brand-dark')}>
            <span className="h-0.5 w-6 rounded bg-accent" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <Tag className={cn('text-2xl font-bold leading-tight sm:text-3xl md:text-4xl', light ? 'text-white' : 'text-primary')}>{title}</Tag>
        {description && <p className={cn('mt-3 text-base md:text-lg', light ? 'text-primary-100' : 'text-ink-muted')}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
