import { Router } from 'express';
import { isDbUp } from '../config/db.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import authRoutes from './auth/auth.routes.js';
import * as banners from './banners/banners.routes.js';
import * as categories from './categories/categories.routes.js';
import * as dashboard from './dashboard/dashboard.routes.js';
import * as enquiries from './enquiries/enquiries.routes.js';
import * as featured from './featured/featured.routes.js';
import * as products from './products/products.routes.js';
import * as projects from './projects/projects.routes.js';
import * as settings from './settings/settings.routes.js';
import * as uploads from './uploads/uploads.routes.js';

const api = Router();

api.get('/health', (_req, res) => {
  const db = isDbUp() ? 'up' : 'down';
  res.status(db === 'up' ? 200 : 503).json({ status: db === 'up' ? 'ok' : 'degraded', db });
});

// Public
api.use('/settings', settings.publicRouter);
api.use('/banners', banners.publicRouter);
api.use('/categories', categories.publicRouter);
api.use('/products', products.publicRouter);
api.use('/projects', projects.publicRouter);
api.use('/enquiries', enquiries.publicRouter);

// Auth
api.use('/auth', authRoutes);

// Admin (all require an access token)
const admin = Router();
admin.use(requireAdmin);
admin.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
admin.use('/dashboard', dashboard.adminRouter);
admin.use('/categories', categories.adminRouter);
admin.use('/products', products.adminRouter);
admin.use('/projects', projects.adminRouter);
admin.use('/featured', featured.adminRouter);
admin.use('/enquiries', enquiries.adminRouter);
admin.use('/banners', banners.adminRouter);
admin.use('/settings', settings.adminRouter);
admin.use('/uploads', uploads.adminRouter);
api.use('/admin', admin);

export default api;
