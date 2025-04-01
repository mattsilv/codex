/**
 * Standardized Error Handler Module
 * Provides unified error handling for the Codex API
 */

/**
 * Custom API Error class with HTTP status code
 */
export class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Create a validation error
 * @param {string} message - Error message
 * @param {Object} details - Validation error details
 * @returns {ApiError} - API Error with 400 status
 */
export function createValidationError(message, details = null) {
  return new ApiError(400, 'VALIDATION_ERROR', message, details);
}

/**
 * Create a not found error
 * @param {string} resource - Resource that wasn't found
 * @param {string} id - Resource identifier
 * @returns {ApiError} - API Error with 404 status
 */
export function createNotFoundError(resource, id = null) {
  const message = id
    ? `${resource} with ID ${id} not found`
    : `${resource} not found`;

  return new ApiError(404, 'NOT_FOUND', message);
}

/**
 * Create an unauthorized error
 * @param {string} message - Error message
 * @returns {ApiError} - API Error with 401 status
 */
export function createUnauthorizedError(message = 'Authentication required') {
  return new ApiError(401, 'UNAUTHORIZED', message);
}

/**
 * Create a forbidden error
 * @param {string} message - Error message
 * @returns {ApiError} - API Error with 403 status
 */
export function createForbiddenError(message = 'Permission denied') {
  return new ApiError(403, 'FORBIDDEN', message);
}

/**
 * Create a conflict error
 * @param {string} message - Error message
 * @returns {ApiError} - API Error with 409 status
 */
export function createConflictError(message) {
  return new ApiError(409, 'CONFLICT', message);
}

/**
 * Create a server error
 * @param {string} message - Error message
 * @param {Object} details - Error details (not exposed to client)
 * @returns {ApiError} - API Error with 500 status
 */
export function createServerError(
  message = 'Internal server error',
  details = null
) {
  console.error('Server error:', message, details);
  return new ApiError(500, 'SERVER_ERROR', 'An internal server error occurred');
}

/**
 * Safely execute a function and handle errors
 * @param {Function} fn - Function to execute
 * @param {Object} errorHandlers - Custom error handlers
 * @returns {Promise<any>} - Result of the function
 * @throws {ApiError} - Standardized API error
 */
export async function tryCatch(fn, errorHandlers = {}) {
  try {
    return await fn();
  } catch (error) {
    // If it's already an ApiError, just rethrow it
    if (error instanceof ApiError) {
      throw error;
    }

    // Check for specific error types and use custom handlers
    for (const [errorType, handler] of Object.entries(errorHandlers)) {
      if (error instanceof errorType || error.name === errorType) {
        throw handler(error);
      }
    }

    // Log the error
    console.error('Unhandled error:', error);

    // Default to server error
    throw createServerError('An unexpected error occurred', {
      message: error.message,
      stack: error.stack,
    });
  }
}
