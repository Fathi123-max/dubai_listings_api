import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for image uploads
const multerStorage = multer.memoryStorage();

// Filter for image files
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadPropertyImages = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'featuredImage', maxCount: 1 },
]);

/**
 * Processes and resizes property images
 */
export const resizePropertyImages = async (req, res, next) => {
  if (!req.files?.images && !req.files?.featuredImage) return next();

  try {
    // 1) Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    // 2) Process images
    if (req.files.images) {
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (file, i) => {
          const filename = `property-${uniqueSuffix}-${i + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/properties/${filename}`);

          req.body.images.push(filename);
        })
      );
    }

    // 3) Process featured image
    if (req.files.featuredImage) {
      const filename = `property-${uniqueSuffix}-featured.jpeg`;

      await sharp(req.files.featuredImage[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/properties/${filename}`);

      req.body.featuredImage = filename;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes property images from the filesystem
 * @param {Object} property - The property object containing images and featuredImage
 * @returns {Promise<void>}
 */
export const deletePropertyImages = async property => {
  try {
    // Delete property images
    if (property.images && property.images.length > 0) {
      await Promise.all(
        property.images.map(async image => {
          const imagePath = path.join(__dirname, '../../public/img/properties', image);
          try {
            await fs.promises.access(imagePath, fs.constants.F_OK);
            await fs.promises.unlink(imagePath);
          } catch (err) {
            // File doesn't exist or couldn't be deleted, which is fine
            if (err.code !== 'ENOENT') {
              console.error(`Error deleting image ${imagePath}:`, err);
            }
          }
        })
      );
    }

    // Delete featured image if exists
    if (property.featuredImage) {
      const featuredImagePath = path.join(
        __dirname,
        '../../public/img/properties',
        property.featuredImage
      );
      try {
        await fs.promises.access(featuredImagePath, fs.constants.F_OK);
        await fs.promises.unlink(featuredImagePath);
      } catch (err) {
        // File doesn't exist or couldn't be deleted, which is fine
        if (err.code !== 'ENOENT') {
          console.error(`Error deleting featured image ${featuredImagePath}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('Error in deletePropertyImages:', error);
    throw error;
  }
};
