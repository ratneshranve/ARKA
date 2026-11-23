import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { controlClasses } from './Input';

const Textarea = forwardRef(function Textarea({ className, invalid, rows = 5, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses(invalid), 'resize-y', className)}
      {...props}
    />
  );
});

export default Textarea;
