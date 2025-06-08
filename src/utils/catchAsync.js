/**
 * A higher-order function that wraps asynchronous route handlers to handle errors
 * @param {Function} fn - The asynchronous route handler function
 * @returns {Function} A new function that handles errors by passing them to Express's next function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
