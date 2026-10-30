import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { config } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import customerRoutes from './modules/customers/customer.routes.js';
import storageRoutes from './modules/storage/storage.routes.js';
import frameSizeRoutes from './modules/frame-sizes/frameSize.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import reminderRoutes from './modules/reminders/reminder.routes.js';

export const app = express();

// Security and utility middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows image loading across domains
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan('dev'));

// Payload parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for local storage mode uploads
app.use('/uploads', express.static(path.resolve(config.storage.localPath)));

// Health check endpoint
app.get(['/', '/health'], (_req, res) => {
  res.status(200).json({
    success: true,
    name: 'Raigon Art Backend REST API',
    version: '2.1.0',
    buildTag: '2026.10.30-reminders-materials-catalogue-v2',
    status: 'ONLINE',
    storageMode: config.storage.mode,
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1 Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/storage', storageRoutes);
app.use('/api/v1/frame-sizes', frameSizeRoutes);
app.use('/api/v1/materials', frameSizeRoutes); // Material terminology alias
app.use('/api/v1/reminders', reminderRoutes); // New Reminders Management Module
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);
