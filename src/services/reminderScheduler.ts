import { db } from '../db/index.js';
import { logger } from '../utils/logger.js';

let intervalHandle: NodeJS.Timeout | null = null;

function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timePart = clean.replace(/AM|PM/g, '').trim();
  const [hourStr, minStr] = timePart.split(':');
  let hour = parseInt(hourStr || '0', 10);
  const min = parseInt(minStr || '0', 10);

  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return hour * 60 + (isNaN(min) ? 0 : min);
}

function getCurrentMinutesKolkata(): { todayStr: string; currentMinutes: number } {
  try {
    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    return { todayStr, currentMinutes: h * 60 + m };
  } catch {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return { todayStr, currentMinutes: now.getHours() * 60 + now.getMinutes() };
  }
}

/**
 * Server-side Reminder & Notification Evaluator.
 * Periodically checks for pending reminders that have reached their scheduled
 * date & time and flags them as notification_triggered=true without duplicating.
 */
export async function evaluateDueReminders(): Promise<number> {
  try {
    const { todayStr, currentMinutes } = getCurrentMinutesKolkata();

    const { data: reminders } = await db.reminders.findReminders({
      filter: 'all',
      limit: 500,
    });

    let triggeredCount = 0;

    for (const r of reminders) {
      if (r.status === 'completed' || r.isCompleted === true) continue;

      const rDate = (r.reminderDate || '').split('T')[0];
      const reminderMin = parseTimeToMinutes(r.reminderTime);
      const isDatePast = rDate < todayStr && rDate !== '';
      const isTodayDue = rDate === todayStr && reminderMin <= currentMinutes;
      const isDue = isDatePast || isTodayDue;

      if (isDue && !r.notificationTriggered) {
        triggeredCount++;
        logger.info(
          `[ReminderScheduler] 🔔 Triggering reminder notification for '${r.title}' (ID: ${r.id}, Customer: ${r.customerName}) scheduled for ${r.reminderDate} ${r.reminderTime}`
        );

        await db.reminders.update(r.id, {
          notificationTriggered: true,
          status: isDatePast ? 'overdue' : 'pending',
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
