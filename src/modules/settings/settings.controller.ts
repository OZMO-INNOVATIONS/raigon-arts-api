import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service.js';

export class SettingsController {
  static async getProfile(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SettingsService.getProfile();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SettingsService.updateProfile(req.body);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}
