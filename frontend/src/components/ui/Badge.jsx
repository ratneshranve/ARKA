import { cn } from '@/lib/cn';

const variants = {
  neutral: 'bg-primary-50 text-primary-600 ring-primary-100',
  brand: 'bg-brand-50 text-brand-dark ring-brand-100',
  accent: 'bg-accent-50 text-accent-deep ring-accent/30',
  panel: 'bg-panel-50 text-panel ring-panel/20',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  dark: 'bg-primary text-white ring-primary',
};

export default function Badge({ variant = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
