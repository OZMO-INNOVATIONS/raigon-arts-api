import { z } from 'zod';

export const createFrameSizeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  width: z.coerce.number().positive('Width must be positive'),
  height: z.coerce.number().positive('Height must be positive'),
  unit: z.string().default('Inch'),
  category: z.string().default('Standard'),
  active: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

export const updateFrameSizeSchema = z.object({
  name: z.string().optional(),
  width: z.coerce.number().positive().optional(),
  height: z.coerce.number().positive().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  active: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});
