import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';

/** ₹{amount} + label when price.show and an amount exist, otherwise "Price on request". */
export default function PriceTag({ price, size = 'md', className }) {
  const show = price?.show && price.amount !== null && price.amount !== undefined;

  if (!show) {
    return <p className={cn('font-semibold text-brand-dark', size === 'lg' ? 'text-lg' : 'text-sm', className)}>Price on request</p>;
  }

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-1.5', className)}>
      <span className={cn('font-bold text-primary', size === 'lg' ? 'text-3xl' : 'text-lg')}>{formatPrice(price.amount)}</span>
      {price.label && <span className={cn('text-ink-muted', size === 'lg' ? 'text-base' : 'text-sm')}>{price.label}</span>}
    </p>
  );
}
