import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier (email or phone) is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  phone: z.string().min(10, 'Valid phone number required'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10, 'Valid phone number required'),
  otp: z.string().min(4, 'OTP code is required'),
});

export const resetPasswordSchema = z.object({
  phone: z.string().min(10, 'Valid phone number required'),
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
