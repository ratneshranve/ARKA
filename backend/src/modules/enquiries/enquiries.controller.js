import { created, noContent, ok } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './enquiries.service.js';

export const create = asyncHandler(async (req, res) => {
  // Honeypot: bots fill the hidden "website" field. Pretend success, save nothing.
  if (req.body.website) {
    req.log?.info({ ip: req.ip }, 'Honeypot triggered — enquiry discarded');
    return created(res, { message: 'Thank you! We will contact you shortly.' });
  }

  const meta = {
    ip: req.ip,
    userAgent: (req.get('user-agent') || '').slice(0, 300),
    pageUrl: req.body.pageUrl || req.get('referer') || '',
  };
  const enquiry = await service.create(req.body, meta);
  return created(res, { id: enquiry._id, message: 'Thank you! We will contact you shortly.' });
});

export const listAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listAdmin(req.query);
  ok(res, items, meta);
});

export const getAdmin = asyncHandler(async (req, res) => ok(res, await service.getById(req.params.id)));
export const update = asyncHandler(async (req, res) => ok(res, await service.update(req.params.id, req.body)));

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  noContent(res);
});
