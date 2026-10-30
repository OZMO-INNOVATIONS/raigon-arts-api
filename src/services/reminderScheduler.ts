import { db } from '../db/index.js';
import { logger } from '../utils/logger.js';

let intervalHandle: NodeJS.Timeout | null = null;

/**
 * Server-side Reminder & Notification Evaluator.
 * Periodically checks for pending reminders that have reached their scheduled
 * date & time and flags them as notification_triggered=true without duplicating.
 */
export async function evaluateDueReminders(): Promise<number> {
  try {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const { data: reminders } = await db.reminders.findReminders({
      filter: 'all',
      limit: 500,
    });

    let triggeredCount = 0;

    for (const r of reminders) {
      if (r.status === 'completed') continue;

      const isDue =
        r.reminderDate < todayStr ||
        (r.reminderDate === todayStr && r.reminderTime <= currentTimeStr);

      if (isDue && !r.notificationTriggered) {
        triggeredCount++;
        logger.info(
          `[ReminderScheduler] 🔔 Triggering reminder notification for '${r.title}' (ID: ${r.id}, Customer: ${r.customerName}) scheduled for ${r.reminderDate} ${r.reminderTime}`
        );

        await db.reminders.update(r.id, {
          notificationTriggered: true,
          status: r.reminderDate < todayStr ? 'overdue' : 'pending',
        });
      }
    }

    return triggeredCount;
  } catch (err) {
    logger.error('[ReminderScheduler] Error during reminder evaluation:', err);
    return 0;
  }
}

export function startReminderScheduler(intervalMs = 60000) {
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }

  logger.info('[ReminderScheduler] Starting background reminder notification evaluator (every 60s)...');
  // Run initial check
  evaluateDueReminders().catch((e) => logger.error('[ReminderScheduler] Initial check error:', e));

  // Set recurring interval
  intervalHandle = setInterval(() => {
    evaluateDueReminders().catch((e) => logger.error('[ReminderScheduler] Interval check error:', e));
  }, intervalMs);

  return intervalHandle;
}

export function stopReminderScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info('[ReminderScheduler] Background scheduler stopped.');
  }
}
