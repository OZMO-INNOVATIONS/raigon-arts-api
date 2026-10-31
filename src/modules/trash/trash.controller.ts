import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { TrashService } from './trash.service.js';

export class TrashController {
  static async getTrash(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TrashService.getTrash();
      res.status(200).json({
        success: true,
        message: 'Trash items retrieved successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const type = (req.body.type || req.query.type || 'order') as 'order' | 'reminder';
      const id = (req.body.id || req.params.id || req.query.id) as string;

      if (!id) {
        res.status(400).json({ success: false, message: 'Item ID is required for restore' });
        return;
      }

      const success = await TrashService.restore(type, id);
      if (!success) {
        res.status(404).json({ success: false, message: 'Could not find ' + type + ' #' + id + ' in trash' });
        return;
      }

      res.status(200).json({
        success: true,
        message: (type === 'order' ? 'Order' : 'Reminder') + ' #' + id + ' restored successfully',
        data: { id, type },
      });
    } catch (err) {
      next(err);
    }
  }

  static async permanentDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type || req.body.type || req.query.type || 'order') as 'order' | 'reminder';
      const id = (req.params.id || req.body.id || req.query.id) as string;

      if (!id) {
        res.status(400).json({ success: false, message: 'Item ID is required for permanent deletion' });
        return;
      }

      const success = await TrashService.permanentDelete(type, id);
      res.status(200).json({
        success: true,
        message: (type === 'order' ? 'Order' : 'Reminder') + ' #' + id + ' permanently deleted',
        data: { id, type, deleted: success },
      });
    } catch (err) {
      next(err);
    }
  }

  static async empty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TrashService.emptyTrash();
      res.status(200).json({
        success: true,
        message: 'Trash emptied permanently',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
