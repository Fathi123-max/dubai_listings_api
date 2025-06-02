import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/auth';
import { getMe } from '../controllers/user.controller.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Email verification routes (public)
router.get('/verify-email/:token', verifyEmail);
router.post('/verify-email/:token', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);

// Protected routes (require authentication)
router.use(protect);
router.get('/me', getMe);
router.patch('/update-password', updatePassword);

export default router;
