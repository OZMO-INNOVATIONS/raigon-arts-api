import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isClientError =
    err.name === 'MulterError' ||
    err.status === 400 ||
    err.statusCode === 400 ||
    (err.message && err.message.includes('Unsupported file type'));

  const statusCode = isClientError ? 400 : (err.status || err.statusCode || 500);
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error(`Unhandled Error [${req.method} ${req.path}]:`, err);
  } else {
    logger.warn(`Client Error [${req.method} ${req.path}] (${statusCode}): ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
}
