import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { useId } from 'react';
import Img from '@/components/ui/Img';
import Spinner from '@/components/ui/Spinner';
import { IMG } from '@/lib/cloudinary';
import { cn } from '@/lib/cn';
import { UPLOAD } from '@/lib/constants';
import { useImageUpload } from './useImageUpload';

/** One image (logo, cover, banner…). value: Image | null. */
export default function SingleImageField({ value, onChange, folder, hint, ratio = '4/3', invalid, dark = false, fit = 'cover' }) {
  const inputId = useId();
  const { upload, discard, uploads } = useImageUpload(folder);
  const busy = uploads.length > 0;

  const pick = async (file) => {
    if (!file) return;
    const image = await upload(file);
    if (image) {
      discard(value);
      onChange(image);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-lg border sm:w-56',
            invalid ? 'border-danger' : 'border-border',
            dark ? 'bg-primary-800' : 'bg-muted',
          )}
        >
          {value?.url ? (
            <Img image={value} alt={value.alt || ''} size={fit === 'cover' ? IMG.card : { w: 600, crop: 'limit' }} ratio={ratio} fit={fit} className={dark ? 'bg-primary-800' : 'bg-muted'} />
          ) : (
            <div className="flex items-center justify-center text-ink-muted" style={{ aspectRatio: ratio }}>
              <ImagePlus className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-brand">
              <Spinner />
              <span className="text-xs font-semibold">{uploads[0].progress}%</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-primary px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
          >
            {value?.url ? <RefreshCw className="h-4 w-4" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
            {value?.url ? 'Replace' : 'Upload image'}
          </label>
          <input
            id={inputId}
            type="file"
            accept={UPLOAD.types.join(',')}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          {value?.url && (
            <button
              type="button"
              onClick={() => {
                discard(value);
                onChange(null);
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-semibold text-danger hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
            </button>
          )}
        </div>
      </div>
      {hint && <p className="mt-2 text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}
