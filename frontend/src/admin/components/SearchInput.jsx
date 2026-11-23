import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Input from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';

/** Search box that reports its value after 400 ms of no typing. */
export default function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search', className }) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, 400);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setText(value);
  }, [value]);
  useEffect(() => {
    if (debounced !== value) onChangeRef.current(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={`relative ${className ?? ''}`}>
      <label className="sr-only" htmlFor="admin-search">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <Input id="admin-search" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="pl-9 pr-10" />
      {text && (
        <button
          type="button"
          onClick={() => setText('')}
          className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center text-ink-muted hover:text-primary"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
