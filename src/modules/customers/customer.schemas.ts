import { z } from 'zod';

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['pending', 'inProgress', 'completed', 'cancelled']).optional(),
  paymentStatus: z.enum(['Unpaid', 'Partial', 'Paid']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().default('orderDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'inProgress', 'completed', 'cancelled']),
});

export const updatePaymentSchema = z.object({
  advance: z.coerce.number().min(0),
  paymentStatus: z.enum(['Unpaid', 'Partial', 'Paid']).optional(),
});
