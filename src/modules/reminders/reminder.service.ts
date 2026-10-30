import { db } from '../../db/index.js';
import { ReminderDTO, ReminderFilters, ReminderPriority, ReminderStatus } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export class ReminderService {
  static async list(filters: ReminderFilters) {
    return db.reminders.findReminders(filters);
  }

  static async getById(id: string) {
    const reminder = await db.reminders.findById(id);
    if (!reminder) {
      throw { status: 404, message: `Reminder with ID ${id} not found.` };
    }
    return reminder;
  }

  static async create(data: {
    id?: string;
    title: string;
    customerName: string;
    customerId: string;
    orderId?: string;
    description?: string;
    reminderDate: string;
    reminderTime: string;
    assignedStaff?: string;
    priority?: ReminderPriority;
    status?: ReminderStatus;
  }) {
    const reminderId = data.id || `REM-${Date.now()}`;
    const reminder: ReminderDTO = {
      id: reminderId,
      title: data.title,
      customerName: data.customerName,
      customerId: data.customerId,
      orderId: data.orderId || '',
      description: data.description || '',
      reminderDate: data.reminderDate,
      reminderTime: data.reminderTime,
      assignedStaff: data.assignedStaff || 'Unassigned',
      priority: data.priority || 'medium',
      status: data.status || 'pending',
      completedBy: '',
      completedAt: '',
      notificationTriggered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`[ReminderService] Creating reminder ${reminderId} for customer ${data.customerId}`);
    return db.reminders.create(reminder);
  }

  static async update(
    id: string,
    updates: Partial<ReminderDTO>,
    actorName?: string
  ) {
    const existing = await db.reminders.findById(id);
    if (!existing) {
      throw { status: 404, message: `Reminder with ID ${id} not found.` };
    }

    // Auto-fill completion metadata if being marked completed
    if (updates.status === 'completed' && existing.status !== 'completed') {
      updates.completedBy = updates.completedBy || actorName || 'Authorized User';
      updates.completedAt = updates.completedAt || new Date().toISOString();
    }

    updates.updatedAt = new Date().toISOString();
    logger.info(`[ReminderService] Updating reminder ${id}`);
    const updated = await db.reminders.update(id, updates);
    return updated;
  }

  static async delete(id: string) {
    const existing = await db.reminders.findById(id);
    if (!existing) {
      throw { status: 404, message: `Reminder with ID ${id} not found.` };
    }
    return db.reminders.delete(id);
  }

  static async getStats() {
    return db.reminders.getStats();
  }
}
