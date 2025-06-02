import sharp from 'sharp';
import User from '../../models/User.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import { deleteFile } from '../../utils/fileUpload.js';

/**
 * Middleware to set the current user ID in params for getMe
 */
export const setUserIdFromMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * Middleware to handle user photo upload
 */
export const uploadUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.body.photo = req.file.filename;
  next();
};

/**
 * Middleware to resize and save user photo
 */
export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

/**
 * Middleware to check if user exists and has permission
 */
export const checkUserPermission = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Attach user to request for use in the next middleware
  req.userData = user;
  next();
});

/**
 * Middleware to clean up user photo if update fails
 */
export const cleanupUserPhotoOnError = (err, req, res, next) => {
  if (req.file && req.file.filename) {
    deleteFile(`public/img/users/${req.file.filename}`);
  }
  next(err);
};
