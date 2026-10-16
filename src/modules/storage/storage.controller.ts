import { Request, Response, NextFunction } from 'express';
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

      const uploaded = await StorageService.processAndUploadPhoto('standalone', req.file);

      res.status(200).json({
        success: true,
        data: uploaded,
      });
    } catch (err) {
      next(err);
    }
  }
}
