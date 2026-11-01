import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { StorageService } from './storage.service.js';

export class StorageController {
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided. Send file in "file" form-data field.',
        });
        return;
      }

      const mime = (req.file.mimetype || '').toLowerCase();
      const ext = path.extname(req.file.originalname || '').toLowerCase();
      const isAudio =
        mime.startsWith('audio/') ||
        ['.m4a', '.mp3', '.wav', '.aac', '.ogg', '.webm'].includes(ext);

      const uploaded = isAudio
        ? await StorageService.uploadAudio('standalone', req.file)
        : await StorageService.processAndUploadPhoto('standalone', req.file);

      res.status(200).json({
        success: true,
        data: uploaded,
      });
    } catch (err) {
      next(err);
    }
  }
}
