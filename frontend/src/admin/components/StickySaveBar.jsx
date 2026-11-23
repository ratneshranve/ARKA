import Button from '@/components/ui/Button';

/** Sticky footer with Cancel / Save for admin forms. */
export default function StickySaveBar({ onCancel, saving, disabled, saveLabel = 'Save', note }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-border bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {note && <p className="text-sm text-ink-muted sm:mr-auto">{note}</p>}
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="brand" loading={saving} disabled={disabled}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
