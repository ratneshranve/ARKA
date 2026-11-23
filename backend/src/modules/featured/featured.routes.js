import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.js';
import { Product } from '../../models/Product.js';
import { Project } from '../../models/Project.js';
import { ok } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { objectId } from '../common.validation.js';

const reorderFeaturedSchema = z.object({
  type: z.enum(['product', 'project']),
  ids: z.array(objectId).max(50),
});

/**
 * PATCH /api/admin/featured/reorder — sets the featured list for a type in the given order.
 * Items in `ids` become featured (featuredOrder = index); any other featured items are un-featured.
 */
const reorder = asyncHandler(async (req, res) => {
  const { type, ids } = req.body;
  const Model = type === 'product' ? Product : Project;
  await Model.updateMany({ isFeatured: true, _id: { $nin: ids } }, { isFeatured: false, featuredOrder: 0 });
  if (ids.length) {
    await Model.bulkWrite(
      ids.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { isFeatured: true, featuredOrder: index } },
      })),
    );
  }
  ok(res, { message: 'Featured order saved' });
});

export const adminRouter = Router();
adminRouter.patch('/reorder', validate({ body: reorderFeaturedSchema }), reorder);
