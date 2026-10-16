import multer from 'multer';

// Use memory storage for direct processing with Sharp before persisting
const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/jpg',
    'application/pdf',
  ];

  if (allowed.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, HEIC`));
  }
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
