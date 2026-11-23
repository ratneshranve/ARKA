import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams, reorderSchema } from '../common.validation.js';
import * as c from './banners.controller.js';
import * as v from './banners.validation.js';

export const publicRouter = Router();
publicRouter.get('/', c.listPublic);

export const adminRouter = Router();
adminRouter.get('/', c.listAdmin);
adminRouter.post('/', validate({ body: v.bannerSchema }), c.create);
adminRouter.patch('/reorder', validate({ body: reorderSchema }), c.reorder);
adminRouter.patch('/:id', validate({ params: idParams, body: v.updateBannerSchema }), c.update);
adminRouter.delete('/:id', validate({ params: idParams }), c.remove);
