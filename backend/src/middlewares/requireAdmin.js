import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Session expired', 'TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
  }

  const admin = await Admin.findById(payload.sub).select('name email passwordChangedAt').lean();
  if (!admin) throw ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');

  // Tokens issued before the last password change are no longer valid.
  if (admin.passwordChangedAt && payload.iat < Math.floor(admin.passwordChangedAt.getTime() / 1000)) {
    throw ApiError.unauthorized('Session expired', 'TOKEN_EXPIRED');
  }

  req.admin = { id: String(admin._id), name: admin.name, email: admin.email };
  next();
});
