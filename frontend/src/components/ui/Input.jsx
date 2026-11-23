import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const controlClasses = (invalid) =>
  cn(
    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-ink-muted/70',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-muted',
    invalid ? 'border-danger focus:border-danger focus:ring-danger/25' : 'border-border focus:border-brand focus:ring-brand/25',
  );

const Input = forwardRef(function Input({ className, invalid, ...props }, ref) {
  return (
    <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlClasses(invalid), 'min-h-[44px]', className)} {...props} />
  );
});

export default Input;
