import { z } from 'zod';
import { isCloudinaryConfigured } from '../../config/cloudinary.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { created, ok } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { destroy, uploadBuffer } from '../../utils/cloudinaryUpload.js';

export const UPLOAD_FOLDERS = ['products', 'projects', 'banners', 'site'];

const folderSchema = z.object({ folder: z.enum(UPLOAD_FOLDERS, { message: 'Invalid upload folder' }) });
export const deleteSchema = z.object({ publicId: z.string().trim().min(1).max(300) });

const ensureConfigured = () => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'UPLOADS_NOT_CONFIGURED', 'Image uploads are not configured. Add Cloudinary keys to backend/.env.');
  }
};

export const upload = asyncHandler(async (req, res) => {
  ensureConfigured();
  const { folder } = folderSchema.parse(req.body);
  const image = await uploadBuffer(req.file.buffer, folder);
  created(res, { ...image, alt: '' });
});

export const remove = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  // Only allow deleting assets inside this site's folder.
  if (!publicId.startsWith(`${env.CLOUDINARY_FOLDER}/`)) {
    throw ApiError.badRequest('Invalid image id', 'INVALID_PUBLIC_ID');
  }
  await destroy(publicId);
  ok(res, { message: 'Image deleted' });
});
