import { Router } from 'express';
import { formLimiter, loginLimiter } from '../../middlewares/rateLimiters.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { validate } from '../../middlewares/validate.js';
import * as c from './auth.controller.js';
import * as v from './auth.validation.js';

const router = Router();

router.post('/login', loginLimiter, validate({ body: v.loginSchema }), c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
router.get('/me', requireAdmin, c.me);
router.post('/forgot-password', formLimiter, validate({ body: v.forgotPasswordSchema }), c.forgotPassword);
router.post('/reset-password', formLimiter, validate({ body: v.resetPasswordSchema }), c.resetPassword);
router.patch('/change-password', requireAdmin, validate({ body: v.changePasswordSchema }), c.changePassword);
router.patch('/profile', requireAdmin, validate({ body: v.profileSchema }), c.updateProfile);

export default router;
