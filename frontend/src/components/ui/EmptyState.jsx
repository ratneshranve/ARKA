import { Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-lg border border-dashed border-primary-200 bg-muted/60 px-6 py-14 text-center', className)}>
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand shadow-card">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
