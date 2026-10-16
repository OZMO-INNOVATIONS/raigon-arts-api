import { Request, Response, NextFunction } from 'express';
import { FrameSizeService } from './frameSize.service.js';

export class FrameSizeController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const data = await FrameSizeService.list(activeOnly);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FrameSizeService.create(req.body);
      res.status(201).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;
      const data = await FrameSizeService.update(code, req.body);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;
      const result = await FrameSizeService.delete(code);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}
