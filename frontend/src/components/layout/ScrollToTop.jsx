import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** On pathname change: scroll to top and move focus to <main> (query-string changes are ignored). */
export default function ScrollToTop({ mainId = 'main' }) {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.getElementById(mainId)?.focus({ preventScroll: true });
  }, [pathname, hash, mainId]);

  return null;
}
