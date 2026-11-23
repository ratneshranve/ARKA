import { ok } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './settings.service.js';

export const getPublic = asyncHandler(async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  ok(res, await service.getPublicSettings());
});

export const getAdmin = asyncHandler(async (_req, res) => {
  ok(res, await service.getSettings());
});

export const update = asyncHandler(async (req, res) => {
  ok(res, await service.updateSettings(req.body));
});
