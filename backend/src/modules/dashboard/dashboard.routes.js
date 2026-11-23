import { Router } from 'express';
import { getDashboard } from './dashboard.controller.js';

export const adminRouter = Router();
adminRouter.get('/', getDashboard);
