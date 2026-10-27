import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export class KeepAliveService {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Resolve public health URL for keeping the server warm
   */
  public static getTargetUrl(): string {
    if (process.env.KEEP_ALIVE_URL) {
      return process.env.KEEP_ALIVE_URL;
    }
    if (process.env.RENDER_EXTERNAL_URL) {
      return `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')}/health`;
    }
    return 'https://raigon-arts-api-1a3z.onrender.com/health';
  }

  /**
   * Ping the health endpoint to prevent cloud host spin-down / sleep
   */
  public static async ping(): Promise<{ success: boolean; status?: number; latencyMs: number; error?: string }> {
    const targetUrl = this.getTargetUrl();
    const start = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Raigon-KeepAlive-Worker/2.0',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (res.ok) {
        logger.info(`[Keep-Alive] Ping successful (${res.status} OK, ${latencyMs}ms) -> ${targetUrl}`);
        return { success: true, status: res.status, latencyMs };
      } else {
        logger.warn(`[Keep-Alive] Ping returned non-200 (${res.status}) -> ${targetUrl}`);
        return { success: false, status: res.status, latencyMs, error: `HTTP ${res.status}` };
      }
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const errorMsg = err.name === 'AbortError' ? 'Timeout (20s)' : (err.message || String(err));
      logger.warn(`[Keep-Alive] Ping failed (${latencyMs}ms): ${errorMsg}`);
      return { success: false, latencyMs, error: errorMsg };
    }
  }

  /**
   * Start 10-minute automated Keep-Alive cycle
   * Render free instances spin down after 15 minutes of inactivity;
   * pinging every 10 minutes guarantees the container stays 100% warm 24/7.
   */
  public static start(intervalMinutes: number = 10) {
    if (this.isRunning) return;
    this.isRunning = true;

    const intervalMs = Math.max(intervalMinutes, 5) * 60 * 1000;
    const targetUrl = this.getTargetUrl();

    logger.info(`[Keep-Alive] Background worker active. Target: ${targetUrl} (every ${intervalMinutes}m).`);

    // First warm-up ping 2 minutes after startup
    setTimeout(() => {
      this.ping().catch(() => {});
    }, 120000);

    // Regular interval
    this.timer = setInterval(() => {
      this.ping().catch(() => {});
    }, intervalMs);

    // Unref timer so it doesn't block process exit if shutting down
    if (this.timer && typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  public static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }
}
