import Property from '../../models/Property.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import { filterObj, buildPropertyQuery, applyQueryFeatures } from './property.utils.js';
import { deletePropertyImages } from '../../middleware/upload/upload.middleware.js';

/**
 * Gets all properties with filtering, sorting, and pagination
 */
export const getAllProperties = catchAsync(async (req, res) => {
  // Build and execute query
  let query = buildPropertyQuery(req);
  query = await applyQueryFeatures(query, req);

  const properties = await query;

  res.status(200).json({
    status: 'success',
    results: properties.length,
    data: {
      properties,
    },
  });
});

/**
 * Gets a single property by ID
 */
export const getProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new AppError('No property found with that ID', 404);
  }

  // Increment views
  property.views += 1;
  await property.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      property,
    },
  });
});

/**
 * Creates a new property
 */
export const createProperty = catchAsync(async (req, res) => {
  // Allow nested routes
  if (!req.body.listedBy) req.body.listedBy = req.user.id;

  const newProperty = await Property.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      property: newProperty,
    },
  });
});

/**
 * Updates a property
 */
export const updateProperty = catchAsync(async (req, res, next) => {
  // 1) Check if property exists
  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  // 2) Check if user is the owner or admin
  if (property.listedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this property', 403));
  }

  // 3) Filter out unwanted fields
  const filteredBody = filterObj(
    req.body,
    'title',
    'description',
    'price',
    'pricePer',
    'propertyType',
    'bedrooms',
    'bathrooms',
    'area',
    'areaUnit',
    'location',
    'amenities',
    'status',
    'yearBuilt',
    'parkingSpaces',
    'furnishingStatus',
    'isFeatured',
    'images',
    'featuredImage'
  );

  // 4) Update property
  const updatedProperty = await Property.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      property: updatedProperty,
    },
  });
});

/**
 * Deletes a property
 */
export const deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  // Check if user is the owner or admin
  if (property.listedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this property', 403));
  }

  // Delete property images
  await deletePropertyImages(property);

  // Delete property
  await Property.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
