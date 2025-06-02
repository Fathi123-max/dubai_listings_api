import Review from '../../models/Review.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * @desc    Get all reviews (optionally filtered by property)
 * @route   GET /api/v1/reviews
 * @route   GET /api/v1/properties/:propertyId/reviews
 * @access  Public
 */
export const getAllReviews = catchAsync(async (req, res) => {
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

/**
 * @desc    Get a single review
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
export const getReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('No review found with that ID', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

/**
 * @desc    Create a new review
 * @route   POST /api/v1/reviews
 * @route   POST /api/v1/properties/:propertyId/reviews
 * @access  Private/User
 */
export const createReview = catchAsync(async (req, res) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

/**
 * @desc    Update a review
 * @route   PATCH /api/v1/reviews/:id
 * @access  Private/User, Admin
 */
export const updateReview = catchAsync(async (req, res) => {
  // Filter out unwanted fields
  const filteredBody = {
    review: req.body.review,
    rating: req.body.rating,
  };

  const updatedReview = await Review.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private/User, Admin
 */
export const deleteReview = catchAsync(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
