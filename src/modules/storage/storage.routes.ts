import { Router } from 'express';
import { StorageController } from './storage.controller.js';
import { uploadSinglePhoto } from '../../middleware/upload.middleware.js';
import { optionalToken } from '../../middleware/auth.middleware.js';

const router = Router();

// 3.1 Standalone Photo Upload
router.post('/upload', optionalToken, uploadSinglePhoto, StorageController.upload);

export default router;
