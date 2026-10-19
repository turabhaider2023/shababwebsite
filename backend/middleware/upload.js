import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDir = path.resolve('uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

export function handleUpload(req, res, next) {
  upload.array('images', 6)(req, res, (error) => {
    if (!error) return next();
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Each image must be under 5 MB' : error.message;
    return res.status(400).json({ message: message || 'Image upload failed' });
  });
}

export function removeLocalImages(images = []) {
  for (const image of images) {
    if (typeof image !== 'string' || !image.startsWith('/uploads/')) continue;
    const relative = image.replace('/uploads/', '');
    if (!relative || relative.includes('..')) continue;
    fs.promises.unlink(path.join(uploadDir, relative)).catch(() => {});
  }
}
