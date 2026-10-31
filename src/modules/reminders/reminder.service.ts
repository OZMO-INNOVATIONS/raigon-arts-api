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
    customerId?: string;
    orderId?: string;
    description?: string;
    reminderDate: string;
    reminderTime?: string;
    assignedStaff?: string;
    priority?: ReminderPriority;
    status?: ReminderStatus;
    isCompleted?: boolean;
    phone?: string;
    region?: string;
  }) {
    const reminderId = data.id || `REM-${Date.now()}`;
    
    // Normalize reminderDate to YYYY-MM-DD if ISO string passed
    let normalizedDate = data.reminderDate;
    if (normalizedDate.includes('T')) {
      normalizedDate = normalizedDate.split('T')[0];
    }

    const isDone = data.isCompleted === true || data.status === 'completed';
    const statusVal: ReminderStatus = isDone ? 'completed' : (data.status || 'pending');

    const reminder: ReminderDTO = {
      id: reminderId,
      title: data.title,
      customerName: data.customerName,
      customerId: data.customerId || '',
      orderId: data.orderId || '',
      description: data.description || '',
      reminderDate: normalizedDate,
      reminderTime: data.reminderTime || '10:00 AM',
      assignedStaff: data.assignedStaff || 'Unassigned',
      priority: data.priority || 'medium',
      status: statusVal,
      isCompleted: isDone,
      completedBy: isDone ? 'Admin' : '',
      completedAt: isDone ? new Date().toISOString() : '',
      notificationTriggered: false,
      phone: data.phone || '',
      region: data.region || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`[ReminderService] Creating reminder ${reminderId} for customer ${data.customerId || 'N/A'}`);
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

    // Normalize reminderDate if updated
    if (updates.reminderDate && updates.reminderDate.includes('T')) {
      updates.reminderDate = updates.reminderDate.split('T')[0];
    }

    // Auto-sync isCompleted and status
    if (updates.isCompleted === true || updates.status === 'completed') {
      updates.status = 'completed';
      updates.isCompleted = true;
      updates.completedBy = updates.completedBy || actorName || 'Authorized User';
      updates.completedAt = updates.completedAt || new Date().toISOString();
    } else if (updates.isCompleted === false) {
      updates.isCompleted = false;
      if (updates.status === undefined) {
        updates.status = 'pending';
      }
      updates.completedBy = '';
      updates.completedAt = '';
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
