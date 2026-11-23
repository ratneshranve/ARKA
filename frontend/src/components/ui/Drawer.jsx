import { X } from 'lucide-react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/lib/cn';

/** Side drawer with overlay, scroll lock, focus trap and Esc to close. */
export default function Drawer({ open, onClose, side = 'right', title, id, children, className }) {
  const ref = useRef(null);
  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 animate-fade-in bg-primary-900/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'absolute top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl',
          side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left',
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-base font-bold text-primary">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-muted hover:bg-muted hover:text-primary"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
