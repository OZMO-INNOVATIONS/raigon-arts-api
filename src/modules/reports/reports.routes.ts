import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { optionalToken } from '../../middleware/auth.middleware.js';

const router = Router();

// 6.1 Revenue & Sales Report
router.get('/summary', optionalToken, ReportsController.getSummary);

export default router;
