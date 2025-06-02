/**
 * Filter object to only include allowed fields
 * @param {Object} obj - The object to filter
 * @param {...string} allowedFields - Fields allowed in the result
 * @returns {Object} Filtered object
 */
export const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Removes undefined fields from an object
 * @param {Object} obj - The object to clean
 * @returns {Object} Cleaned object
 */
export const removeUndefinedFields = obj => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};
