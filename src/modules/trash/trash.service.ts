import { db } from '../../db/index.js';
import { logger } from '../../utils/logger.js';
import { TrashResponseDTO } from '../../types/index.js';

export class TrashService {
  /**
   * Fetch all soft-deleted orders and reminders in trash.
   * Auto-purges items older than 14 days before returning.
   */
  static async getTrash(): Promise<TrashResponseDTO> {
    return await db.trash.getTrashItems();
  }

  /**
   * Restore a soft-deleted order or reminder back to active state.
   */
  static async restore(type: 'order' | 'reminder', id: string): Promise<boolean> {
    const cleanId = id.trim();
    logger.info('[Trash] Restoring ' + type + ' #' + cleanId + '...');

    if (type === 'order' || (type as string) === 'customer') {
      return await db.trash.restoreCustomer(cleanId);
    } else if (type === 'reminder') {
      return await db.trash.restoreReminder(cleanId);
    }
    return false;
  }

  /**
   * Permanently delete an item from trash, including files from storage.
   */
  static async permanentDelete(type: 'order' | 'reminder', id: string): Promise<boolean> {
    const cleanId = id.trim();
    logger.info('[Trash] Permanently deleting ' + type + ' #' + cleanId + '...');

    if (type === 'order' || (type as string) === 'customer') {
      return await db.trash.permanentlyDeleteCustomer(cleanId);
    } else if (type === 'reminder') {
      return await db.trash.permanentlyDeleteReminder(cleanId);
    }
    return false;
  }

  /**
   * Clear all items in trash permanently.
   */
  static async emptyTrash(): Promise<{ purgedOrders: number; purgedReminders: number }> {
    logger.info('[Trash] Emptying entire trash bin...');
    return await db.trash.emptyTrash();
  }
}
