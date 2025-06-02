import Review from '../../models/Review.js';
import Property from '../../models/Property.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * Middleware to set property and user IDs from request parameters and user
 */
export const setPropertyUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.property) req.body.property = req.params.propertyId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

/**
 * Middleware to check if the property exists
 */
export const checkPropertyExists = catchAsync(async (req, res, next) => {
  if (req.body.property) {
    const property = await Property.findById(req.body.property);
    if (!property) {
      return next(new AppError('No property found with that ID', 404));
    }
  }
  next();
});

/**
 * Middleware to check if the user has already reviewed the property
 */
export const checkDuplicateReview = catchAsync(async (req, res, next) => {
  if (req.body.property && req.user) {
    const existingReview = await Review.findOne({
      property: req.body.property,
      user: req.user.id,
    });

    if (existingReview) {
      return next(new AppError('You have already reviewed this property', 400));
    }
  }
  next();
});

/**
 * Middleware to check if the user is the review owner or admin
 */
export const checkReviewOwnership = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  if (review.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  // Attach review to request object for use in the next middleware
  req.review = review;
  next();
});
