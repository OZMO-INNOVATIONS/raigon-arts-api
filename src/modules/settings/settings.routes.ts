import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { optionalToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalToken);

// 8.1 Get Workshop Profile
router.get('/profile', SettingsController.getProfile);

// 8.2 Update Workshop Profile
router.put('/profile', SettingsController.updateProfile);

// 8.3 Get Global Data Retention Policy & Eligible Records
router.get('/retention', SettingsController.getRetentionPolicy);

// 8.4 Update Global Data Retention Policy (e.g. change 45 days globally)
router.put('/retention', SettingsController.updateRetentionPolicy);

// 8.5 Trigger Manual Data Cleanup
router.post('/cleanup/trigger', SettingsController.triggerCleanup);

export default router;
