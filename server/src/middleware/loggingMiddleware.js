// loggingMiddleware.js
/**
 * HTTP request logger middleware for Express
 * Logs incoming requests and response status
 */

const loggingMiddleware = (req, res, next) => {
  const startTime = new Date();

  // Log request details
  console.log(`[${startTime.toISOString()}] ${req.method} ${req.originalUrl}`);

  // Process request
  res.on("finish", () => {
    const duration = new Date() - startTime;
    const statusCode = res.statusCode;
    const statusColor =
      statusCode >= 500
        ? "\x1b[31m" // Red
        : statusCode >= 400
        ? "\x1b[33m" // Yellow
        : statusCode >= 300
        ? "\x1b[36m" // Cyan
        : statusCode >= 200
        ? "\x1b[32m" // Green
        : "\x1b[0m"; // No color

    console.log(
      `[${new Date().toISOString()}] ${statusColor}${statusCode}\x1b[0m ${
        req.method
      } ${req.originalUrl} - ${duration}ms`
    );
  });

  next();
};

module.exports = loggingMiddleware;
