import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, '-')
      .slice(0, 40);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image uploads are allowed', 400));
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const buildUploadUrl = (filename) => `/uploads/${filename}`;
