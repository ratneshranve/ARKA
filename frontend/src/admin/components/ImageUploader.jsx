import { ImagePlus, Star, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import Img from '@/components/ui/Img';
import Spinner from '@/components/ui/Spinner';
import { IMG } from '@/lib/cloudinary';
import { cn } from '@/lib/cn';
import { UPLOAD } from '@/lib/constants';
import SortableList from './SortableList';
import { useImageUpload } from './useImageUpload';

/**
 * Multi-image uploader: multi-select, drag & drop files, drag to reorder, remove,
 * upload progress and per-image alt text. The first image is the cover.
 */
export default function ImageUploader({ value = [], onChange, folder, max = 10, label = 'Images', invalid, coverLabel = 'Cover', onUploadingChange }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const { upload, discard, uploads } = useImageUpload(folder);
  const valueRef = useRef(value);
  valueRef.current = value;

  const remaining = max - value.length - uploads.length;

  const handleFiles = async (fileList) => {
    const files = [...fileList].slice(0, Math.max(0, remaining));
    if (fileList.length > files.length) toast.error(`You can add up to ${max} images.`);
    if (!files.length) return;
    onUploadingChange?.(true);
    const results = await Promise.all(files.map((f) => upload(f)));
    onUploadingChange?.(false);
    const added = results.filter(Boolean);
    if (added.length) onChange([...valueRef.current, ...added]);
  };

  const remove = (img) => {
    discard(img);
    onChange(value.filter((v) => v.publicId !== img.publicId));
  };

  const setAlt = (publicId, alt) => onChange(value.map((v) => (v.publicId === publicId ? { ...v, alt } : v)));

  return (
    <div>
      {value.length > 0 && (
        <SortableList
          items={value}
          getId={(img) => img.publicId}
          onReorder={onChange}
          layout="grid"
          className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
          itemClassName="rounded-lg border border-border bg-white"
          renderItem={(img, index, handle) => (
            <div className="flex gap-3 p-2">
              <div className="relative w-28 shrink-0 overflow-hidden rounded-md">
                <Img image={img} alt={img.alt} size={IMG.thumb} ratio="4/3" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    <Star className="h-3 w-3" aria-hidden="true" /> {coverLabel}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label className="sr-only" htmlFor={`alt-${img.publicId}`}>
                  Alt text for image {index + 1}
                </label>
                <input
                  id={`alt-${img.publicId}`}
                  value={img.alt || ''}
                  onChange={(e) => setAlt(img.publicId, e.target.value)}
                  placeholder="Alt text (describe the image)"
                  maxLength={200}
                  className="min-h-[40px] w-full rounded-md border border-border px-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                />
                <div className="mt-auto flex items-center justify-between">
                  {handle}
                  <button
                    type="button"
                    onClick={() => remove(img)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md text-danger hover:bg-red-50"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}

      {uploads.length > 0 && (
        <ul className="mb-4 space-y-2" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.key} className="flex items-center gap-3 rounded-lg border border-border bg-white p-2">
              <img src={u.preview} alt="" className="h-12 w-16 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{u.name}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-primary-100">
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${u.progress}%` }} />
                </div>
              </div>
              <Spinner className="text-brand" label={`Uploading ${u.name}`} />
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
            dragOver ? 'border-brand bg-brand-50' : invalid ? 'border-danger bg-red-50/40' : 'border-primary-200 bg-muted hover:border-brand',
          )}
        >
          <ImagePlus className="h-8 w-8 text-brand" aria-hidden="true" />
          <span className="mt-2 font-semibold text-primary">Click to upload or drag images here</span>
          <span className="mt-1 text-sm text-ink-muted">
            JPG, PNG or WEBP, up to {UPLOAD.maxMb} MB each · {value.length}/{max} {label.toLowerCase()}
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={UPLOAD.types.join(',')}
            multiple={max > 1}
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}
