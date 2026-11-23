import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const Checkbox = forwardRef(function Checkbox({ label, description, className, id, ...props }, ref) {
  return (
    <label htmlFor={id} className={cn('flex min-h-[44px] cursor-pointer items-start gap-3 py-2', className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-brand accent-brand focus:ring-brand"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-sm text-ink-muted">{description}</span>}
      </span>
    </label>
  );
});

export default Checkbox;
