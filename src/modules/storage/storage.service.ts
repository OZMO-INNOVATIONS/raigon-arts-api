import fs from 'fs';
import path from 'path';
import { config } from '../../config/env.js';
import { getSupabase, isSupabaseConfigured } from '../../config/supabase.js';
import { processImageForVault } from '../../utils/imageProcessor.js';
import { logger } from '../../utils/logger.js';

export class StorageService {
  private static localUploadDir = config.storage.localPath;

  private static ensureLocalDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static async uploadBuffer(
    storagePath: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<{ publicUrl: string; path: string }> {
    const cleanPath = storagePath.replace(/^\/+/, '');

    // Supabase Storage Mode
    if (config.storage.mode === 'supabase' && isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        const bucket = config.supabase.storageBucket;

        let uploadResult = await sb.storage.from(bucket).upload(cleanPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

        if (
          uploadResult.error &&
          ((uploadResult.error as any).code === 'NoSuchBucket' ||
            uploadResult.error.message?.includes('Bucket not found') ||
            (uploadResult.error as any).statusCode === '404')
        ) {
          logger.info(`Bucket "${bucket}" not found. Auto-creating public bucket in Supabase...`);
          await sb.storage.createBucket(bucket, { public: true });
          uploadResult = await sb.storage.from(bucket).upload(cleanPath, buffer, {
            contentType: mimeType,
            upsert: true,
          });
        }

        if (uploadResult.error) {
          logger.error('Supabase storage upload error:', uploadResult.error);
          throw uploadResult.error;
        }

        const { data: urlData } = sb.storage.from(bucket).getPublicUrl(cleanPath);
        return {
          publicUrl: urlData.publicUrl,
          path: cleanPath,
        };
      } catch (err) {
        logger.warn('Falling back to local disk storage due to Supabase upload error:', err);
      }
    }

    // Local Disk Mode
    const fullLocalPath = path.join(this.localUploadDir, cleanPath);
    this.ensureLocalDir(path.dirname(fullLocalPath));
    await fs.promises.writeFile(fullLocalPath, buffer);

    const baseUrl = config.storage.cdnBaseUrl || `http://localhost:${config.port}/uploads`;
    const publicUrl = `${baseUrl}/${cleanPath}`;

    return {
      publicUrl,
      path: cleanPath,
    };
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    const cleanPath = filePath.replace(/^\/+/, '');

    if (config.storage.mode === 'supabase' && isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        const bucket = config.supabase.storageBucket;
        await sb.storage.from(bucket).remove([cleanPath]);
        return true;
      } catch (err) {
        logger.error('Error deleting from Supabase Storage:', err);
      }
    }

    const fullLocalPath = path.join(this.localUploadDir, cleanPath);
    if (fs.existsSync(fullLocalPath)) {
      try {
        await fs.promises.unlink(fullLocalPath);
        return true;
      } catch (e) {
        logger.error('Error deleting local file:', e);
      }
    }

    return false;
  }

  static async getFileBuffer(storagePathOrUrl: string): Promise<Buffer | null> {
    const cleanPath = storagePathOrUrl
      .replace(/^https?:\/\/[^/]+\/uploads\//, '')
      .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/[^/]+\//, '')
      .replace(/^\/+/, '');

    // Check local disk first
    const fullLocalPath = path.join(this.localUploadDir, cleanPath);
    if (fs.existsSync(fullLocalPath)) {
      return fs.promises.readFile(fullLocalPath);
    }

    // Download from Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.storage
          .from(config.supabase.storageBucket)
          .download(cleanPath);
        if (data && !error) {
          const arrayBuffer = await data.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }
      } catch (e) {
        logger.error('Error downloading from Supabase Storage:', e);
      }
    }

    return null;
  }

  static async processAndUploadPhoto(
    folder: string,
    file: Express.Multer.File
  ): Promise<{
    fileName: string;
    fileUrl: string;
    thumbnailUrl: string;
    sizeBytes: number;
    mimeType: string;
  }> {
    const processed = await processImageForVault(file.buffer, file.originalname);

    const mainPath = `${folder}/photos/${processed.originalWebp.fileName}`;
    const thumbPath = `${folder}/thumbnails/${processed.thumbnailWebp.fileName}`;

    const [mainResult, thumbResult] = await Promise.all([
      this.uploadBuffer(mainPath, processed.originalWebp.buffer, processed.originalWebp.mimeType),
      this.uploadBuffer(thumbPath, processed.thumbnailWebp.buffer, processed.thumbnailWebp.mimeType),
    ]);

    return {
      fileName: processed.originalWebp.fileName,
      fileUrl: mainResult.publicUrl,
      thumbnailUrl: thumbResult.publicUrl,
      sizeBytes: processed.originalWebp.sizeBytes,
      mimeType: processed.originalWebp.mimeType,
    };
  }
}
