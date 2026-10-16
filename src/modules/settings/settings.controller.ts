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

  static async getRetentionPolicy(_req: Request, res: Response, next: NextFunction) {
    try {
      const { CleanupService } = await import('../../services/cleanup.service.js');
      const data = await CleanupService.getRetentionPolicy();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateRetentionPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const { CleanupService } = await import('../../services/cleanup.service.js');
      const { days, enabled, target } = req.body;
      const data = await CleanupService.updateRetentionPolicy(days, enabled, target);
      res.status(200).json({
        success: true,
        message: `Global retention policy updated. Data older than ${data.retentionDays} days will be automatically purged.`,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async triggerCleanup(req: Request, res: Response, next: NextFunction) {
    try {
      const { CleanupService } = await import('../../services/cleanup.service.js');
      const daysOverride = req.body.days !== undefined ? Number(req.body.days) : undefined;
      const result = await CleanupService.executeCleanup(daysOverride);
      res.status(200).json({
        success: true,
        message: `Cleanup completed. Purged ${result.purgedCustomers} customers and ${result.purgedPhotos} photos older than ${result.retentionDays} days.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
