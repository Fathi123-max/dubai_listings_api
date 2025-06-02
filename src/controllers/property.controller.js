import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Property from '../models/Property.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for image uploads
const multerStorage = multer.memoryStorage();

// Filter for image files
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadPropertyImages = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'featuredImage', maxCount: 1 },
]);

// Helper function to process and save images
export const resizePropertyImages = catchAsync(async (req, res, next) => {
  if (!req.files.images && !req.files.featuredImage) return next();

  // 1) Create unique filename
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  
  // 2) Process images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `property-${uniqueSuffix}-${i + 1}.jpeg`;
        
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/properties/${filename}`);
        
        req.body.images.push(filename);
      })
    );
  }

  // 3) Process featured image
  if (req.files.featuredImage) {
    const filename = `property-${uniqueSuffix}-featured.jpeg`;
    
    await sharp(req.files.featuredImage[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/properties/${filename}`);
    
    req.body.featuredImage = filename;
  }

  next();
});

// Helper function to filter fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getAllProperties = catchAsync(async (req, res, next) => {
  // 1) Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // 2) Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
  let query = Property.find(JSON.parse(queryStr));

  // 3) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // 4) Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // 5) Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    const numProperties = await Property.countDocuments();
    if (skip >= numProperties) throw new Error('This page does not exist');
  }
  
  query = query.skip(skip).limit(limit);

  // EXECUTE QUERY
  const properties = await query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: properties.length,
    data: {
      properties,
    },
  });
});

export const getProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('No property found with that ID', 404));
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

export const createProperty = catchAsync(async (req, res, next) => {
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

export const updateProperty = catchAsync(async (req, res, next) => {
  // 1) Check if property exists
  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  // 2) Check if user is the owner or admin
  if (
    property.listedBy.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new AppError('You do not have permission to update this property', 403)
    );
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
    'isFeatured'
  );

  // 4) Update property
  const updatedProperty = await Property.findByIdAndUpdate(
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
      property: updatedProperty,
    },
  });
});

export const deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  // Check if user is the owner or admin
  if (
    property.listedBy.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new AppError('You do not have permission to delete this property', 403)
    );
  }

  // Delete property images
  if (property.images && property.images.length > 0) {
    property.images.forEach((image) => {
      const imagePath = path.join(__dirname, `../public/img/properties/${image}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
  }

  // Delete featured image if exists
  if (property.featuredImage) {
    const featuredImagePath = path.join(
      __dirname,
      `../public/img/properties/${property.featuredImage}`
    );
    if (fs.existsSync(featuredImagePath)) {
      fs.unlinkSync(featuredImagePath);
    }
  }

  // Delete property
  await Property.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getPropertiesWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const properties = await Property.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    results: properties.length,
    data: {
      data: properties,
    },
  });
});

export const getPropertyStats = catchAsync(async (req, res, next) => {
  const stats = await Property.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$propertyType',
        numProperties: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
