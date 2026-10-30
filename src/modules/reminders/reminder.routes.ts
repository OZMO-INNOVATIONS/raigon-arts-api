import { Router } from 'express';
import { ReminderController } from './reminder.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

// All reminder endpoints require authentication (Admin or Staff)
router.use(authenticateToken);

// Reminder Stats / Dashboard Summary
router.get('/summary/stats', ReminderController.getStats);

// Reminder CRUD
router.get('/', ReminderController.list);
router.post('/', ReminderController.create);
router.get('/:id', ReminderController.getById);
router.patch('/:id', ReminderController.update);
router.put('/:id', ReminderController.update);
router.delete('/:id', ReminderController.delete);

export default router;
