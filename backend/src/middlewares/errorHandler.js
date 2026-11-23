import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function normalise(err) {
  if (err instanceof ApiError) return err;

  if (err instanceof ZodError) {
    return new ApiError(
      400,
      'VALIDATION_ERROR',
      'Please check the highlighted fields',
      err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return new ApiError(
      400,
      'VALIDATION_ERROR',
      'Please check the highlighted fields',
      Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
    );
  }

  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, 'INVALID_ID', `Invalid value for ${err.path}`);
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'field';
    return new ApiError(409, 'DUPLICATE', `A record with this ${field} already exists`, [
      { path: field, message: `This ${field} is already in use` },
    ]);
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new ApiError(413, 'FILE_TOO_LARGE', `Images must be ${env.UPLOAD_MAX_MB} MB or smaller`);
    }
    return new ApiError(400, 'UPLOAD_ERROR', err.message);
  }

  if (err?.type === 'entity.parse.failed') return new ApiError(400, 'INVALID_JSON', 'Malformed JSON body');
  if (err?.type === 'entity.too.large') return new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body too large');

  return null;
}

export const errorHandler = (err, req, res, _next) => {
  const known = normalise(err);
  const status = known?.status ?? 500;

  if (status >= 500) {
    req.log?.error({ err }, 'Unhandled error');
  }

  const body = {
    success: false,
    error: {
      code: known?.code ?? 'INTERNAL_ERROR',
      message: known?.message ?? 'Something went wrong. Please try again later.',
      ...(known?.details && { details: known.details }),
      ...(status >= 500 && { requestId: req.id }),
      ...(!env.isProd && !known && { stack: err?.stack }),
    },
  };

  res.status(status).json(body);
};
