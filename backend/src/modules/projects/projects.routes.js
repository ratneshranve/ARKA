import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams, slugParams } from '../common.validation.js';
import { featuredSchema, visibilitySchema } from '../products/products.validation.js';
import * as c from './projects.controller.js';
import * as v from './projects.validation.js';

export const publicRouter = Router();
publicRouter.get('/', validate({ query: v.publicListQuery }), c.listPublic);
publicRouter.get('/:slug', validate({ params: slugParams }), c.getPublic);

export const adminRouter = Router();
adminRouter.get('/', validate({ query: v.adminListQuery }), c.listAdmin);
adminRouter.post('/', validate({ body: v.createProjectSchema }), c.create);
adminRouter.get('/:id', validate({ params: idParams }), c.getAdmin);
adminRouter.patch('/:id', validate({ params: idParams, body: v.updateProjectSchema }), c.update);
adminRouter.delete('/:id', validate({ params: idParams }), c.remove);
adminRouter.patch('/:id/visibility', validate({ params: idParams, body: visibilitySchema }), c.setVisibility);
adminRouter.patch('/:id/featured', validate({ params: idParams, body: featuredSchema }), c.setFeatured);
