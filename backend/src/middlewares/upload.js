import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    return cb(new ApiError(415, 'UNSUPPORTED_FILE_TYPE', 'Only JPG, PNG and WEBP images are allowed'));
  },
});

/** Verifies the real file type from its first bytes — never trust the filename or mimetype. */
function detectImageType(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export const uploadImage = [
  multerUpload.single('image'),
  (req, _res, next) => {
    if (!req.file) return next(ApiError.badRequest('An image file is required', 'FILE_REQUIRED'));
    if (!detectImageType(req.file.buffer)) {
      return next(new ApiError(415, 'UNSUPPORTED_FILE_TYPE', 'The file is not a valid JPG, PNG or WEBP image'));
    }
    return next();
  },
];
