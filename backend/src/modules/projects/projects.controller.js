import { created, noContent, ok } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './projects.service.js';

export const listPublic = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listPublic(req.query);
  ok(res, items, meta);
});

export const getPublic = asyncHandler(async (req, res) => ok(res, await service.getPublicBySlug(req.params.slug)));

export const listAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listAdmin(req.query);
  ok(res, items, meta);
});

export const getAdmin = asyncHandler(async (req, res) => ok(res, await service.getById(req.params.id)));
export const create = asyncHandler(async (req, res) => created(res, await service.create(req.body)));
export const update = asyncHandler(async (req, res) => ok(res, await service.update(req.params.id, req.body)));

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  noContent(res);
});

export const setVisibility = asyncHandler(async (req, res) =>
  ok(res, await service.setVisibility(req.params.id, req.body.isPublished)),
);

export const setFeatured = asyncHandler(async (req, res) =>
  ok(res, await service.setFeatured(req.params.id, req.body.isFeatured)),
);
