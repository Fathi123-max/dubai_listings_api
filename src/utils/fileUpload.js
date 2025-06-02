import multer from 'multer';
import sharp from 'sharp';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from './AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/img/users');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const multerStorage = multer.memoryStorage();

// Filter for image files
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Middleware for uploading a single file
 * @param {string} fieldName - The name of the file field in the form
 */
export const uploadSingle = (fieldName) => upload.single(fieldName);

/**
 * Middleware for uploading multiple files
 * @param {string} fieldName - The name of the file field in the form
 * @param {number} maxCount - Maximum number of files to upload
 */
export const uploadMultiple = (fieldName, maxCount) =>
  upload.array(fieldName, maxCount);

/**
 * Resize and save user profile photo
 * @param {Buffer} file - The file buffer
 * @param {string} userId - The user ID for the filename
 * @returns {Promise<string>} The filename of the saved image
 */
export const resizeAndSavePhoto = async (file, userId) => {
  const filename = `user-${userId}-${Date.now()}.jpeg`;
  const filepath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(filepath);

  return filename;
};

/**
 * Delete a file from the filesystem
 * @param {string} filename - The name of the file to delete
 * @param {string} [subfolder='users'] - The subfolder in the public/img directory
 */
export const deleteFile = (filename, subfolder = 'users') => {
  if (!filename) return;

  const filePath = path.join(__dirname, `../public/img/${subfolder}`, filename);
  
  // Check if file exists before trying to delete
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file ${filename}:`, err);
    });
  }
};

export default upload;
