import { Router } from 'express';
import { formLimiter } from '../../middlewares/rateLimiters.js';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../common.validation.js';
import * as c from './enquiries.controller.js';
import * as v from './enquiries.validation.js';

export const publicRouter = Router();
publicRouter.post('/', formLimiter, validate({ body: v.createEnquirySchema }), c.create);

export const adminRouter = Router();
adminRouter.get('/', validate({ query: v.adminListQuery }), c.listAdmin);
adminRouter.get('/:id', validate({ params: idParams }), c.getAdmin);
adminRouter.patch('/:id', validate({ params: idParams, body: v.updateEnquirySchema }), c.update);
adminRouter.delete('/:id', validate({ params: idParams }), c.remove);
