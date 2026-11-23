import { cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/cn';
import FieldError from './FieldError';
import Label from './Label';

/**
 * Label + control + hint + error. Wires id, aria-invalid and aria-describedby onto the child control.
 */
export default function Field({ id, label, required, hint, error, className, children, counter }) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, { id, invalid: Boolean(error), 'aria-describedby': describedBy, 'aria-required': required || undefined })
    : children;

  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
          {counter && <span className="text-xs text-ink-muted">{counter}</span>}
        </div>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
