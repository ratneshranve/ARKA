import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function FormSuccess({ name, onReset }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-xl border border-brand-100 bg-brand-50 px-6 py-10 text-center focus:outline-none">
      <CheckCircle2 className="mx-auto h-14 w-14 text-brand" aria-hidden="true" />
      <h3 className="mt-4 text-xl font-bold text-primary">Thank you, {name}.</h3>
      <p className="mt-2 text-ink-muted">Our team will contact you shortly.</p>
      <button type="button" onClick={onReset} className="link mt-5 inline-flex min-h-[44px] items-center">
        Send another
      </button>
    </div>
  );
}
