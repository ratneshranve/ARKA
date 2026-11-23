import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import Spinner from './Spinner';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm',
  secondary: 'bg-primary text-white hover:bg-primary-800 shadow-sm',
  brand: 'bg-brand text-white hover:bg-brand-dark shadow-sm',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  'outline-light': 'border-2 border-white/80 text-white hover:bg-white hover:text-primary',
  ghost: 'text-primary hover:bg-primary-50',
  danger: 'bg-danger text-white hover:bg-red-700 shadow-sm',
};

const sizes = {
  sm: 'min-h-[44px] px-3.5 text-sm gap-1.5',
  md: 'min-h-[44px] px-5 text-[15px] gap-2',
  lg: 'min-h-[52px] px-7 text-base gap-2.5',
};

/**
 * Button — renders a <button>, a router <Link> (when `to` is set) or an <a> (when `href` is set).
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, to, href, children, type = 'button', ...props },
  ref,
) {
  const classes = cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Spinner className="-ml-1" label="Please wait" />}
      {children}
    </button>
  );
});

export default Button;
