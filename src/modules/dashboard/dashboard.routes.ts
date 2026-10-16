import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { optionalToken } from '../../middleware/auth.middleware.js';

const router = Router();

// 5.1 Dashboard Summary Statistics
router.get('/stats', optionalToken, DashboardController.getStats);

export default router;
