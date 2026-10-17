import { Request, Response, NextFunction } from 'express';
import { WhatsAppModuleService } from './whatsapp.service.js';

export class WhatsAppController {
  static async getStatus(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = WhatsAppModuleService.getStatus();
      res.status(200).json({ success: true, data: status });
    } catch (err) {
      next(err);
    }
  }
  static async sendOrderConfirmation(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.body;
      const result = await WhatsAppModuleService.sendOrderConfirmation(customerId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async sendStatusUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, status, customNote } = req.body;
      const result = await WhatsAppModuleService.sendStatusUpdate(customerId, status, customNote);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
