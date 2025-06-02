import express from 'express';
import {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
  getMe,
  updateUser,
  deleteUser,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../controllers/user.controller.js';
import {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/auth.controller.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.get('/me', getMe, getUser);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

// Admin routes
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
