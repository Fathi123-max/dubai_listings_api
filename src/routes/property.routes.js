import express from 'express';
import {
  getAllProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertiesWithin,
  getPropertyStats,
  uploadPropertyImages,
  resizePropertyImages
} from '../controllers/property.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import reviewRouter from './review.routes.js';

const router = express.Router();

// Nested routes for reviews
router.use('/:propertyId/reviews', reviewRouter);

// Public routes
router.get('/', getAllProperties);
router.get('/:id', getProperty);
router.get('/properties-within/:distance/center/:latlng/unit/:unit', getPropertiesWithin);
router.get('/stats', getPropertyStats);

// Protected routes (require authentication)
router.use(protect);

// Routes that require authentication and specific roles
router.post('/', restrictTo('agent', 'admin'), createProperty);
router.patch(
  '/:id',
  restrictTo('agent', 'admin'),
  uploadPropertyImages,
  resizePropertyImages,
  updateProperty
);
router.delete('/:id', restrictTo('agent', 'admin'), deleteProperty);

export default router;
