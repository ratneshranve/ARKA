import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Demo seed images live in frontend/public and have no Cloudinary asset behind them.
const isLocal = (publicId) => !publicId || publicId.startsWith('local-demo/');

export function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
        resource_type: 'image',
        transformation: [{ width: 2000, crop: 'limit', quality: 'auto:good' }],
      },
      (err, result) => {
        if (err) return reject(err);
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );
    stream.end(buffer);
  });
}

/** Deletes one image. Failures are logged and never thrown. */
export async function destroy(publicId) {
  if (isLocal(publicId) || !isCloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (err) {
    logger.warn({ err: err.message, publicId }, 'Cloudinary delete failed');
  }
}

export async function destroyMany(publicIds = []) {
  await Promise.all(publicIds.filter(Boolean).map((id) => destroy(id)));
}

/** publicIds present in `before` but missing from `after`. */
export function removedPublicIds(before = [], after = []) {
  const keep = new Set(after.filter(Boolean).map((img) => img.publicId));
  return before.filter(Boolean).map((img) => img.publicId).filter((id) => id && !keep.has(id));
}

/** Fire-and-forget cleanup so DB operations are never blocked by Cloudinary. */
export function cleanupLater(publicIds) {
  if (publicIds?.length) setImmediate(() => destroyMany(publicIds));
}
