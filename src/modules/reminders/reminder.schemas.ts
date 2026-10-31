import { z } from 'zod';

export const createReminderSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Reminder title is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerId: z.string().optional().default(''),
  orderId: z.string().optional().default(''),
  description: z.string().optional().default(''),
  reminderDate: z.string().min(1, 'Reminder date is required'),
  reminderTime: z.string().optional().default('10:00 AM'),
  assignedStaff: z.string().optional().default('Unassigned'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'completed', 'overdue']).default('pending'),
  isCompleted: z.boolean().optional(),
  phone: z.string().optional().default(''),
  region: z.string().optional().default(''),
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).optional(),
  customerName: z.string().min(1).optional(),
  customerId: z.string().optional(),
  orderId: z.string().optional(),
  description: z.string().optional(),
  reminderDate: z.string().optional(),
  reminderTime: z.string().optional(),
  assignedStaff: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'completed', 'overdue']).optional(),
  isCompleted: z.boolean().optional(),
  completedBy: z.string().optional(),
  completedAt: z.string().optional(),
  notificationTriggered: z.boolean().optional(),
  phone: z.string().optional(),
  region: z.string().optional(),
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
