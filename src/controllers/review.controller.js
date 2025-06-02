import Review from '../models/Review.js';
import Property from '../models/Property.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.propertyId) filter = { property: req.params.propertyId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

export const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.property) req.body.property = req.params.propertyId;
  if (!req.body.user) req.body.user = req.user.id;

  // Check if property exists
  const property = await Property.findById(req.body.property);
  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  // Check if user has already reviewed this property
  const existingReview = await Review.findOne({
    property: req.body.property,
    user: req.user.id,
  });

  if (existingReview) {
    return next(
      new AppError('You have already reviewed this property', 400)
    );
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

export const updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if user is the review owner or admin
  if (review.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to update this review', 403)
    );
  }

  // Filter out unwanted fields
  const filteredBody = {
    review: req.body.review,
    rating: req.body.rating,
  };

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if user is the review owner or admin
  if (review.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to delete this review', 403)
    );
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const setPropertyUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.property) req.body.property = req.params.propertyId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
