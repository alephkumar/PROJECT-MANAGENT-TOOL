/**
 * Wraps async route handlers so rejected promises are passed to next(err)
 * instead of requiring a try/catch block in every controller function.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
