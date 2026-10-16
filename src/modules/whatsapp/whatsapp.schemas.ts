import { z } from 'zod';

export const sendOrderConfirmationSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
});

export const sendStatusUpdateSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  status: z.string().min(1, 'status is required'),
  customNote: z.string().optional(),
});
