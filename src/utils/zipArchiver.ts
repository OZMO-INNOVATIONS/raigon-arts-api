import archiver from 'archiver';
import { Response } from 'express';
import { StorageService } from '../modules/storage/storage.service.js';
import { logger } from './logger.js';

export interface PhotoAsset {
  fileName: string;
  fileUrl: string;
}

export async function streamCustomerPhotosZip(
  customerId: string,
  photos: PhotoAsset[],
  res: Response
): Promise<void> {
  const archive = archiver('zip', {
    zlib: { level: 6 }, // compression level
  });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${customerId}_photos.zip"`);

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      logger.warn('Archiver warning:', err);
    } else {
      logger.error('Archiver error:', err);
    }
  });

  archive.on('error', (err) => {
    logger.error('ZIP archive fatal error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate ZIP archive' });
    }
  });

  archive.pipe(res);

  for (const photo of photos) {
    try {
      const buffer = await StorageService.getFileBuffer(photo.fileUrl);
      if (buffer) {
        archive.append(buffer, { name: photo.fileName });
      } else {
        logger.warn(`Could not fetch buffer for ${photo.fileName} (${photo.fileUrl})`);
      }
    } catch (e) {
      logger.error(`Error appending ${photo.fileName} to zip:`, e);
    }
  }

  // If no photos or all failed, add a readme text file inside
  if (photos.length === 0) {
    archive.append(`No high-resolution photos currently stored for Order ${customerId}.`, {
      name: 'README.txt',
    });
  }

  await archive.finalize();
}
