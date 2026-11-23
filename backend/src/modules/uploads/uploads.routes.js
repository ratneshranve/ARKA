import { Router } from 'express';
import { uploadImage } from '../../middlewares/upload.js';
import { validate } from '../../middlewares/validate.js';
import * as c from './uploads.controller.js';

export const adminRouter = Router();
adminRouter.post('/', uploadImage, c.upload);
adminRouter.delete('/', validate({ body: c.deleteSchema }), c.remove);
