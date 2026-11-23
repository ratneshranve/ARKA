import { created, noContent, ok } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './categories.service.js';

export const listPublic = asyncHandler(async (_req, res) => ok(res, await service.listPublic()));
export const listAdmin = asyncHandler(async (_req, res) => ok(res, await service.listAdmin()));
export const create = asyncHandler(async (req, res) => created(res, await service.create(req.body)));
export const update = asyncHandler(async (req, res) => ok(res, await service.update(req.params.id, req.body)));

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  noContent(res);
});

export const reorder = asyncHandler(async (req, res) => {
  await service.reorder(req.body.ids);
  ok(res, { message: 'Order saved' });
});
