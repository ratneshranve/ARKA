import { useState } from 'react';
import Markdown from '@/components/common/Markdown';
import Textarea from '@/components/ui/Textarea';
import { cn } from '@/lib/cn';

/** Textarea with a Write / Preview toggle and a short formatting hint. */
export default function MarkdownField({ id, value = '', onChange, rows = 8, maxLength = 10000, invalid, ...rest }) {
  const [tab, setTab] = useState('write');
  const tabCls = (active) =>
    cn('min-h-[40px] rounded-md px-3 text-sm font-semibold', active ? 'bg-white text-primary shadow-sm' : 'text-ink-muted hover:text-primary');

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="inline-flex rounded-lg bg-muted p-1" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'write'} className={tabCls(tab === 'write')} onClick={() => setTab('write')}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={tab === 'preview'} className={tabCls(tab === 'preview')} onClick={() => setTab('preview')}>
            Preview
          </button>
        </div>
        <span className="text-xs text-ink-muted">
          {value.length.toLocaleString()}/{maxLength.toLocaleString()}
        </span>
      </div>
      {tab === 'write' ? (
        <Textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} invalid={invalid} {...rest} />
      ) : (
        <div className="min-h-[160px] rounded-lg border border-border bg-white p-4">
          {value ? <Markdown>{value}</Markdown> : <p className="text-sm text-ink-muted">Nothing to preview yet.</p>}
        </div>
      )}
      <p className="mt-1.5 text-xs text-ink-muted">
        Formatting: <code>**bold**</code>, <code>_italic_</code>, <code>## Heading</code>, <code>- list item</code>, <code>[link](https://…)</code>
      </p>
    </div>
  );
}
