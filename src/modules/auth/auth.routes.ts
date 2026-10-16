import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import {
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from './auth.schemas.js';

const router = Router();

// 1.1 Login (Public)
router.post('/login', validate({ body: loginSchema }), AuthController.login);

// 1.2 Send WhatsApp / SMS OTP
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), AuthController.forgotPassword);

// 1.3 Verify OTP
router.post('/verify-otp', validate({ body: verifyOtpSchema }), AuthController.verifyOtp);

// 1.4 Reset Password
router.post('/reset-password', validate({ body: resetPasswordSchema }), AuthController.resetPassword);

// 1.5 Get Current Profile (Protected)
router.get('/me', authenticateToken, AuthController.me);

// 1.6 Refresh Access Token
router.post('/refresh', validate({ body: refreshTokenSchema }), AuthController.refresh);

export default router;
