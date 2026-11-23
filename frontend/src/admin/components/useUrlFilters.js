import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Filters + pagination synced to the URL query string.
 * setFilters({ status: 'hidden' }) resets to page 1 unless `page` is part of the update.
 */
export function useUrlFilters(keys) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const out = { page: Math.max(1, Number(params.get('page')) || 1) };
    keys.forEach((k) => {
      out[k] = params.get(k) || '';
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, keys.join(',')]);

  const setFilters = useCallback(
    (updates) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([k, v]) => {
            if (v === '' || v === undefined || v === null || (k === 'page' && Number(v) === 1)) next.delete(k);
            else next.set(k, String(v));
          });
          if (!('page' in updates)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return [filters, setFilters];
}
