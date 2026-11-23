import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams, reorderSchema } from '../common.validation.js';
import * as c from './categories.controller.js';
import * as v from './categories.validation.js';

export const publicRouter = Router();
publicRouter.get('/', c.listPublic);

export const adminRouter = Router();
adminRouter.get('/', c.listAdmin);
adminRouter.post('/', validate({ body: v.createCategorySchema }), c.create);
adminRouter.patch('/reorder', validate({ body: reorderSchema }), c.reorder);
adminRouter.patch('/:id', validate({ params: idParams, body: v.updateCategorySchema }), c.update);
adminRouter.delete('/:id', validate({ params: idParams }), c.remove);
