import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cldUrl, IMG } from '@/lib/cloudinary';

/** Full-screen image viewer with keyboard arrows, swipe and Esc to close. */
export default function Lightbox({ images, index, onIndexChange, onClose, title }) {
  const ref = useRef(null);
  const touchX = useRef(null);
  const open = index !== null && index !== undefined;
  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  const count = images?.length ?? 0;
  const prev = () => onIndexChange((index - 1 + count) % count);
  const next = () => onIndexChange((index + 1) % count);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') onIndexChange((i) => (i - 1 + count) % count);
      if (e.key === 'ArrowRight') onIndexChange((i) => (i + 1) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, count, onIndexChange]);

  if (!open || !count) return null;
  const image = images[index];

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} — image viewer` : 'Image viewer'}
      tabIndex={-1}
      className="fixed inset-0 z-[120] flex flex-col bg-primary-900/95 animate-fade-in"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50 && count > 1) (dx > 0 ? prev : next)();
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm text-primary-100">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Close image viewer"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-2 pb-6 sm:px-16" onClick={onClose}>
        <img
          src={cldUrl(image.url, IMG.detail)}
          alt={image.alt || title || ''}
          className="max-h-full max-w-full rounded object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
              aria-label="Next image"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
