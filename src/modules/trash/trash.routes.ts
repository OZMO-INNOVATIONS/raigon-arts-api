import { Router } from 'express';
import { TrashController } from './trash.controller.js';
import { optionalToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalToken);

// 1. Get all trashed orders & reminders
router.get('/', TrashController.getTrash);

// 2. Restore an item from trash
router.post('/restore', TrashController.restore);
router.post('/restore/:type/:id', TrashController.restore);

// 3. Permanently delete a specific item
router.delete('/permanent', TrashController.permanentDelete);
router.delete('/:type/:id', TrashController.permanentDelete);

// 4. Empty entire trash bin
router.delete('/empty', TrashController.empty);

export default router;
