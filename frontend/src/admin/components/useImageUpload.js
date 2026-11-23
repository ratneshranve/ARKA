import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin.api';
import { getErrorMessage } from '@/api/http';
import { UPLOAD } from '@/lib/constants';

/** Client-side checks before upload: type and size. Returns an error message or null. */
export function checkFile(file) {
  if (!UPLOAD.types.includes(file.type)) return `${file.name}: only JPG, PNG and WEBP images are allowed`;
  if (file.size > UPLOAD.maxMb * 1024 * 1024) return `${file.name}: images must be ${UPLOAD.maxMb} MB or smaller`;
  return null;
}

/**
 * Upload helper shared by ImageUploader and SingleImageField.
 * Tracks which publicIds were uploaded in this form session, so removing them before saving
 * deletes them from Cloudinary immediately (saved images are cleaned up by the server on save).
 */
export function useImageUpload(folder) {
  const fresh = useRef(new Set());
  const [uploads, setUploads] = useState([]); // [{ key, name, progress, preview }]

  const upload = useCallback(
    async (file) => {
      const problem = checkFile(file);
      if (problem) {
        toast.error(problem);
        return null;
      }
      const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      setUploads((u) => [...u, { key, name: file.name, progress: 0, preview }]);
      try {
        const image = await adminApi.uploads.upload(file, folder, (progress) =>
          setUploads((u) => u.map((x) => (x.key === key ? { ...x, progress } : x))),
        );
        fresh.current.add(image.publicId);
        return image;
      } catch (err) {
        toast.error(getErrorMessage(err, `Upload failed for ${file.name}`));
        return null;
      } finally {
        URL.revokeObjectURL(preview);
        setUploads((u) => u.filter((x) => x.key !== key));
      }
    },
    [folder],
  );

  const discard = useCallback((image) => {
    if (image?.publicId && fresh.current.has(image.publicId)) {
      fresh.current.delete(image.publicId);
      adminApi.uploads.remove(image.publicId).catch(() => {});
    }
  }, []);

  return { upload, discard, uploads, uploading: uploads.length > 0 };
}
