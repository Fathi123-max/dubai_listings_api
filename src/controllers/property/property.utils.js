import Property from '../../models/Property.js';
import { filterObj } from '../../utils/objectUtils.js';

export { filterObj };

/**
 * Builds a query for getting all properties with filtering, sorting, and pagination
 */
export const buildPropertyQuery = req => {
  // 1) Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // 2) Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  return Property.find(JSON.parse(queryStr));
};

/**
 * Applies sorting, field limiting, and pagination to the query
 */
export const applyQueryFeatures = async (query, req) => {
  // 1) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // 2) Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // 3) Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    const numProperties = await Property.countDocuments();
    if (skip >= numProperties) throw new Error('This page does not exist');
  }

  query = query.skip(skip).limit(limit);

  return query;
};
