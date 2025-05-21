// errorMiddleware.js
/**
 * Central error handling middleware for Express
 * Handles all uncaught errors and provides consistent error responses
 */

// Development error handler with full stack traces
const developmentErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  res.status(statusCode).json({
    status: "error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    errors: err.errors || undefined,
  });
};

// Production error handler (no stack traces for security)
const productionErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log error to console but don't expose to client
  console.error(`[ERROR] ${err.message}`);

  res.status(statusCode).json({
    status: "error",
    message: err.statusCode === 500 ? "Internal Server Error" : err.message,
    errors: err.errors || undefined,
  });
};

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler:
    process.env.NODE_ENV === "production"
      ? productionErrorHandler
      : developmentErrorHandler,
};
