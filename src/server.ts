import fs from 'fs';
import { app } from './app.js';
import { config } from './config/env.js';
import { testDbConnection } from './db/pool.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  // Ensure local uploads directory exists
  if (!fs.existsSync(config.storage.localPath)) {
    fs.mkdirSync(config.storage.localPath, { recursive: true });
  }

  // Attempt DB connection test
  await testDbConnection();

  const server = app.listen(config.port, () => {
    logger.info(`=======================================================`);
    logger.info(`  RAIGON ART REST API v2.0.0 (Production Edition)`);
    logger.info(`  Server running on http://localhost:${config.port}`);
    logger.info(`  Environment: ${config.nodeEnv}`);
    logger.info(`  Storage Mode: ${config.storage.mode}`);
    logger.info(`  Data Retention: ${config.retention.defaultDays} days (Auto-cleanup: ${config.retention.autoCleanupEnabled})`);
    logger.info(`  Ready to replace Firebase & SharedPreferences`);
    logger.info(`=======================================================`);
  });

  // Start automated 45-day retention cleanup background scheduler
  const { CleanupService } = await import('./services/cleanup.service.js');
  CleanupService.startScheduledCleanup();

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error('Fatal error during server startup:', err);
  process.exit(1);
});
