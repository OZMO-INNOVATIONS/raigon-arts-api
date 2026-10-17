import multer from 'multer';

import path from 'path';

// Use memory storage for direct processing with Sharp before persisting
const storage = multer.memoryStorage();

const allowedMimes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/jpg',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'application/pdf',
]);

const allowedExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.gif',
  '.bmp',
  '.tiff',
  '.pdf',
]);

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase().trim();
  const ext = path.extname(file.originalname || '').toLowerCase().trim();

  // Accept if valid MIME type
  if (allowedMimes.has(mime)) {
    return cb(null, true);
  }

  // Accept if valid file extension (covers application/octet-stream or missing MIME headers)
  if (allowedExtensions.has(ext)) {
    return cb(null, true);
  }

  const err: any = new Error(
    `Unsupported file type: ${mime || 'unknown'}${ext ? ` (${ext})` : ''}. Allowed: JPEG, PNG, WebP, HEIC, PDF`
  );
  err.status = 400;
  cb(err);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 30,
  },
  fileFilter,
});

export const uploadCustomerFiles = upload.fields([
  { name: 'photos', maxCount: 20 },
  { name: 'frame_photos', maxCount: 20 },
]);

export const uploadSinglePhoto = upload.single('file');
