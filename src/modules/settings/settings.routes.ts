import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { optionalToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalToken);

// 8.1 Get Workshop Profile
router.get('/profile', SettingsController.getProfile);

// 8.2 Update Workshop Profile
router.put('/profile', SettingsController.updateProfile);

export default router;
