import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { AuthService } from './auth.service.js';

export class AuthController {
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = req.body;
      const data = await AuthService.login(identifier, password);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      const data = await AuthService.forgotPassword(phone);
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = req.body;
      const data = await AuthService.verifyOtp(phone, otp);
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { phone, resetToken, newPassword } = req.body;
      const data = await AuthService.resetPassword(phone, resetToken, newPassword);
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const data = await AuthService.refresh(refreshToken);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}
