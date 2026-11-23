import { cn } from '@/lib/cn';

/** Accessible toggle switch (role="switch"). */
export default function Switch({ checked, onChange, label, disabled, className, srOnlyLabel = false, id }) {
  return (
    <label className={cn('inline-flex min-h-[44px] cursor-pointer items-center gap-3', disabled && 'cursor-not-allowed opacity-60', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          checked ? 'bg-brand' : 'bg-primary-200',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
      {label && <span className={cn('text-sm font-medium text-ink', srOnlyLabel && 'sr-only')}>{label}</span>}
    </label>
  );
}
