import { cn } from '@/lib/cn';

export default function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('rounded-lg border border-border bg-white shadow-card', className)} {...props}>
      {children}
    </Tag>
  );
}
