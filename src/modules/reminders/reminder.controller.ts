import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { ReminderService } from './reminder.service.js';
import { createReminderSchema, updateReminderSchema, reminderQuerySchema } from './reminder.schemas.js';

export class ReminderController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedQuery = reminderQuerySchema.parse(req.query);
      const result = await ReminderService.list(validatedQuery as any);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const reminder = await ReminderService.getById(id);
      res.status(200).json({
        success: true,
        data: reminder,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createReminderSchema.parse(req.body);
      const reminder = await ReminderService.create({
        ...validated,
        assignedStaff: validated.assignedStaff || req.user?.name || 'Unassigned',
      });
      res.status(201).json({
        success: true,
        data: reminder,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateReminderSchema.parse(req.body);
      const actorName = req.user?.name || (req.user?.role === 'admin' ? 'Admin' : 'Staff');
      const updated = await ReminderService.update(id, validated, actorName);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ReminderService.delete(id);
      res.status(200).json({
        success: true,
        message: `Reminder ${id} deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await ReminderService.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
}
