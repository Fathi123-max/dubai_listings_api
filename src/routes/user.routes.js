import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { updatePassword } from '../controllers/auth/password.controller.js';
import {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
  updateUser,
  deleteUser,
} from '../controllers/user/user.controller.js';
import {
  setUserIdFromMe,
  uploadUserPhoto,
  resizeUserPhoto,
  checkUserPermission,
  cleanupUserPhotoOnError,
} from '../controllers/user/user.middleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.get('/me', setUserIdFromMe, getUser);
router.patch(
  '/update-me',
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe,
  cleanupUserPhotoOnError // Clean up uploaded file if there's an error
);
router.delete('/delete-me', deleteMe);
router.patch('/update-my-password', updatePassword);

// Admin routes
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers);

// Apply checkUserPermission middleware to routes that operate on specific users
router.use('/:id', checkUserPermission);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
