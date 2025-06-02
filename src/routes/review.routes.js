import express from 'express';
import {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setPropertyUserIds,
  getReview
} from '../controllers/review.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getAllReviews);
router.get('/:id', getReview);

// Protected routes (require authentication)
router.use(protect);

// Routes that require authentication
router.post(
  '/',
  restrictTo('user'),
  setPropertyUserIds,
  createReview
);

router.patch(
  '/:id',
  restrictTo('user', 'admin'),
  updateReview
);

router.delete(
  '/:id',
  restrictTo('user', 'admin'),
  deleteReview
);

export default router;
