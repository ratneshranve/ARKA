import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/** A list of single-line values (phone numbers, emails) with add/remove. */
export default function MultiTextInput({ id, value = [], onChange, max = 5, placeholder, type = 'text', addLabel = 'Add', errors, inputMode, autoComplete }) {
  const items = value.length ? value : [''];
  const update = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex gap-2">
            <Input
              id={i === 0 ? id : undefined}
              type={type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              invalid={Boolean(errors?.[i])}
              aria-label={i === 0 ? undefined : `${placeholder || 'Value'} ${i + 1}`}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-danger hover:bg-red-50"
                aria-label={`Remove ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {errors?.[i]?.message && <p className="mt-1 text-sm text-danger">{errors[i].message}</p>}
        </div>
      ))}
      {items.length < max && (
        <Button variant="ghost" size="sm" onClick={() => onChange([...items, ''])}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {addLabel}
        </Button>
      )}
    </div>
  );
}
