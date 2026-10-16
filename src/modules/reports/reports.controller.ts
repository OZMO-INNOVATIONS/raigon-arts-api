import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service.js';

export class ReportsController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as string) || 'month1';
      const data = await ReportsService.getSummary(period);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}
