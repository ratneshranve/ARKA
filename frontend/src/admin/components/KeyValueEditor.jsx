import { Plus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import SortableList from './SortableList';

const inputCls =
  'min-h-[44px] w-full min-w-0 rounded-lg border border-border bg-white px-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25';

/** Editable [{ label, value }] rows with add, remove and drag-to-reorder. */
export default function KeyValueEditor({ value = [], onChange, max = 40, labelPlaceholder = 'Label', valuePlaceholder = 'Value', errors }) {
  // Stable keys for rows so drag & drop and inputs keep focus while typing.
  const keys = useRef([]);
  const counter = useRef(0);
  while (keys.current.length < value.length) keys.current.push(`row-${counter.current++}`);
  keys.current.length = value.length;

  const rows = value.map((row, i) => ({ ...row, _key: keys.current[i] }));
  const emit = (next) => onChange(next.map(({ _key, ...r }) => r));

  const update = (i, field, v) => emit(rows.map((r, idx) => (idx === i ? { ...r, [field]: v } : r)));
  const remove = (i) => {
    keys.current.splice(i, 1);
    emit(rows.filter((_, idx) => idx !== i));
  };
  const add = () => emit([...rows, { label: '', value: '' }]);
  const reorder = (next) => {
    keys.current = next.map((r) => r._key);
    emit(next);
  };

  return (
    <div>
      {rows.length > 0 && (
        <SortableList
          items={rows}
          getId={(r) => r._key}
          onReorder={reorder}
          className="mb-3 space-y-2"
          renderItem={(row, i, handle) => (
            <div className="flex items-start gap-2">
              <div className="pt-0">{handle}</div>
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[2fr_3fr]">
                <div>
                  <input
                    aria-label={`Row ${i + 1} label`}
                    value={row.label}
                    onChange={(e) => update(i, 'label', e.target.value)}
                    placeholder={labelPlaceholder}
                    maxLength={100}
                    className={cn(inputCls, errors?.[i]?.label && 'border-danger')}
                  />
                  {errors?.[i]?.label && <p className="mt-1 text-xs text-danger">{errors[i].label.message}</p>}
                </div>
                <div>
                  <input
                    aria-label={`Row ${i + 1} value`}
                    value={row.value}
                    onChange={(e) => update(i, 'value', e.target.value)}
                    placeholder={valuePlaceholder}
                    maxLength={500}
                    className={cn(inputCls, errors?.[i]?.value && 'border-danger')}
                  />
                  {errors?.[i]?.value && <p className="mt-1 text-xs text-danger">{errors[i].value.message}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-danger hover:bg-red-50"
                aria-label={`Remove row ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}
      {rows.length < max && (
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add row
        </Button>
      )}
    </div>
  );
}
