import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setPropertyUserIds,
  checkPropertyExists,
  checkDuplicateReview,
  checkReviewOwnership,
} from '../controllers/review';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getAllReviews);
router.get('/:id', getReview);

// Protected routes (require authentication)
router.use(protect);

// Routes that require authentication
// Create review route with all necessary middleware
router.post(
  '/',
  restrictTo('user'),
  setPropertyUserIds,
  checkPropertyExists,
  checkDuplicateReview,
  createReview
);

// Update review route with ownership check
router.patch('/:id', restrictTo('user', 'admin'), checkReviewOwnership, updateReview);

// Delete review route with ownership check
router.delete('/:id', restrictTo('user', 'admin'), checkReviewOwnership, deleteReview);

// Get single review route with ownership check for non-public access if needed
router.get('/:id', getReview);

export default router;
