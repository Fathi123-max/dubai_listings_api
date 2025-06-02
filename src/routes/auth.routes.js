import express from 'express';
import { signup, login, getMe, forgotPassword, resetPassword, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Protected routes (require authentication)
router.use(protect);
router.get('/me', getMe);
router.patch('/update-password', updatePassword);

export default router;
