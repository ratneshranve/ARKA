import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import * as c from './settings.controller.js';
import { updateSettingsSchema } from './settings.validation.js';

export const publicRouter = Router();
publicRouter.get('/', c.getPublic);

export const adminRouter = Router();
adminRouter.get('/', c.getAdmin);
adminRouter.put('/', validate({ body: updateSettingsSchema }), c.update);
