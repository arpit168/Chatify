import { ENV } from "../lib/env.js";
import { ApiError } from "../lib/asyncHandler.js";

/**
 * Global Error Handler Middleware for Express
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof SyntaxError ? 400 : 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(ENV.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  // Log server errors
  if (error.statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.url}:`, error);
  }

  return res.status(error.statusCode).json(response);
};

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};
