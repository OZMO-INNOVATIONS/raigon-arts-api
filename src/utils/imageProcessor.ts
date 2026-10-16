import sharp from 'sharp';
import { logger } from './logger.js';

export interface ProcessedImage {
  originalWebp: {
    buffer: Buffer;
    fileName: string;
    sizeBytes: number;
    mimeType: string;
  };
  thumbnailWebp: {
    buffer: Buffer;
    fileName: string;
    sizeBytes: number;
    mimeType: string;
  };
}

export async function processImageForVault(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<ProcessedImage> {
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  const webpFileName = `${baseName}.webp`;
  const thumbFileName = `${baseName}_thumb.webp`;

  try {
    // 1. Convert to high-quality WebP, 85% quality, strip EXIF metadata
    const webpBuffer = await sharp(fileBuffer)
      .rotate() // auto-orient based on EXIF before stripping
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    // 2. Generate 300px thumbnail for fast grid view
    const thumbBuffer = await sharp(fileBuffer)
      .rotate()
      .resize({ width: 300, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    return {
      originalWebp: {
        buffer: webpBuffer,
        fileName: webpFileName,
        sizeBytes: webpBuffer.length,
        mimeType: 'image/webp',
      },
      thumbnailWebp: {
        buffer: thumbBuffer,
        fileName: thumbFileName,
        sizeBytes: thumbBuffer.length,
        mimeType: 'image/webp',
      },
    };
  } catch (error) {
    logger.error('Error processing image with sharp, using fallback:', error);
    // Fallback: return as original buffer if sharp fails (e.g. invalid format)
    return {
      originalWebp: {
        buffer: fileBuffer,
        fileName: originalFilename,
        sizeBytes: fileBuffer.length,
        mimeType: 'image/jpeg',
      },
      thumbnailWebp: {
        buffer: fileBuffer,
        fileName: originalFilename,
        sizeBytes: fileBuffer.length,
        mimeType: 'image/jpeg',
      },
    };
  }
}
