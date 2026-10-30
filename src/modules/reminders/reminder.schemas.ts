import { z } from 'zod';

export const createReminderSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Reminder title is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  orderId: z.string().optional().default(''),
  description: z.string().optional().default(''),
  reminderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  reminderTime: z.string().min(1, 'Reminder time is required'),
  assignedStaff: z.string().optional().default('Unassigned'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'completed', 'overdue']).default('pending'),
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).optional(),
  customerName: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  orderId: z.string().optional(),
  description: z.string().optional(),
  reminderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reminderTime: z.string().optional(),
  assignedStaff: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'completed', 'overdue']).optional(),
  completedBy: z.string().optional(),
  completedAt: z.string().optional(),
  notificationTriggered: z.boolean().optional(),
});

export const reminderQuerySchema = z.object({
  filter: z.enum(['all', 'today', 'upcoming', 'overdue', 'completed']).optional(),
  search: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedStaff: z.string().optional(),
  customerId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  sortBy: z.string().optional().default('reminderDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
