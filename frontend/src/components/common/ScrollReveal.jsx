import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * ScrollReveal: Animates its children when they scroll into the viewport.
 * Props:
 * - delay: in ms (e.g., 100, 200)
 * - direction: 'up' | 'down' | 'left' | 'right' | 'none' (default 'up')
 * - className: additional wrapper classes
 * - as: HTML tag (default 'div')
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.12,
  as: Component = 'div',
  ...props
}) {
  const [revealed, setRevealed] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion settings
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    const current = elementRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [threshold]);

  const directionStyles = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: '',
  };

  return (
    <Component
      ref={elementRef}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]',
        revealed ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${directionStyles[direction] || 'translate-y-8'}`,
        className,
      )}
      style={{
        transitionDelay: revealed && delay ? `${delay}ms` : '0ms',
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
