import { db } from '../db/index.js';
import { config } from '../config/env.js';
import { StorageService } from '../modules/storage/storage.service.js';
import { logger } from '../utils/logger.js';

export interface CleanupResult {
  success: boolean;
  purgedCustomers: number;
  purgedPhotos: number;
  retentionDays: number;
  cutoffDate: string;
  executedAt: string;
}

export class CleanupService {
  private static timer: NodeJS.Timeout | null = null;

  /**
   * Fetch current global data retention configuration and status
   */
  static async getRetentionPolicy() {
    const settings = await db.settings.getProfile();
    const days = settings.data_retention_days ?? config.retention.defaultDays ?? 45;
    const enabled = settings.auto_cleanup_enabled ?? config.retention.autoCleanupEnabled ?? true;
    const target = settings.retention_target ?? config.retention.target ?? 'all';

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Count eligible records
    const allCustomers = await db.customers.getAllForExport();
    const eligibleCustomers = allCustomers.filter((c) => {
      const orderTime = new Date(c.orderDate).getTime();
      return orderTime < cutoff.getTime();
    });

    const eligiblePhotosCount = eligibleCustomers.reduce((acc, c) => acc + (c.photoCount || 0), 0);

    return {
      retentionDays: days,
      autoCleanupEnabled: enabled,
      retentionTarget: target,
      cutoffDate: cutoff.toISOString(),
      eligibleCustomersCount: eligibleCustomers.length,
      eligiblePhotosCount,
    };
  }

  /**
   * Update global retention policy across the entire application
   */
  static async updateRetentionPolicy(days?: number, enabled?: boolean, target?: 'all' | 'photos_only') {
    const updates: any = {};
    if (days !== undefined) updates.data_retention_days = Number(days);
    if (enabled !== undefined) updates.auto_cleanup_enabled = Boolean(enabled);
    if (target !== undefined) updates.retention_target = target;

    await db.settings.updateProfile(updates);
    return this.getRetentionPolicy();
  }

  /**
   * Executes data purging for records older than the retention period
   */
  static async executeCleanup(daysOverride?: number): Promise<CleanupResult> {
    const policy = await this.getRetentionPolicy();
    const days = daysOverride !== undefined ? Number(daysOverride) : policy.retentionDays;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    logger.info(`[Auto-Cleanup] Executing purge for orders older than ${days} days (Cutoff: ${cutoff.toISOString()})...`);

    const allCustomers = await db.customers.getAllForExport();
    const expiredCustomers = allCustomers.filter((c) => {
      const orderTime = new Date(c.orderDate).getTime();
      return orderTime < cutoff.getTime();
    });

    let purgedPhotos = 0;
    let purgedCustomers = 0;

    for (const cust of expiredCustomers) {
      try {
        // 1. Delete all attached photos from Supabase Storage / local storage
        if (cust.photoUrls && cust.photoUrls.length > 0) {
          for (const url of cust.photoUrls) {
            await StorageService.deleteFile(url);
            purgedPhotos++;
          }
        }

        // 2. If retention target is 'all', purge the customer order itself
        if (policy.retentionTarget === 'all') {
          await db.customers.deleteCustomer(cust.id);
          purgedCustomers++;
        } else {
          // 'photos_only' target: clear photo metadata but keep the invoice ledger
          await db.customers.updateCustomer(cust.id, {
            photoCount: 0,
            photoNames: [],
            photoUrls: [],
            photoSizeLabels: [],
          });
        }
      } catch (err) {
        logger.error(`[Auto-Cleanup] Error purging customer ${cust.id}:`, err);
      }
    }

    const result: CleanupResult = {
      success: true,
      purgedCustomers,
      purgedPhotos,
      retentionDays: days,
      cutoffDate: cutoff.toISOString(),
      executedAt: new Date().toISOString(),
    };

    logger.info(
      `[Auto-Cleanup Complete] Purged ${purgedCustomers} customers and ${purgedPhotos} photos older than ${days} days.`
    );

    return result;
  }

  /**
   * Start 24-hour background automated scheduler
   */
  static startScheduledCleanup() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const runCheck = async () => {
      try {
        const policy = await this.getRetentionPolicy();
        if (policy.autoCleanupEnabled) {
          await this.executeCleanup();
        } else {
          logger.info('[Auto-Cleanup] Scheduled run skipped: autoCleanupEnabled is false.');
        }
      } catch (err) {
        logger.error('[Auto-Cleanup Scheduler Error]:', err);
      }
    };

    // Run first check 10 seconds after server boot
    setTimeout(runCheck, 10000);

    // Run every 24 hours (86,400,000 milliseconds)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    this.timer = setInterval(runCheck, TWENTY_FOUR_HOURS);

    logger.info(`[Auto-Cleanup] Daily background cleaner registered (Default Retention: ${config.retention.defaultDays} days).`);
  }
}
