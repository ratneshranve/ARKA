import { AlertTriangle, RotateCw } from 'lucide-react';
import { getErrorMessage } from '@/api/http';
import { cn } from '@/lib/cn';
import Button from './Button';

export default function ErrorState({ error, onRetry, title = 'Could not load this content', className }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50/60 px-6 py-12 text-center', className)}>
      <AlertTriangle className="mb-3 h-10 w-10 text-danger" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <p className="mt-1.5 max-w-md text-ink-muted">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={() => onRetry()}>
          <RotateCw className="h-4 w-4" aria-hidden="true" /> Retry
        </Button>
      )}
    </div>
  );
}
