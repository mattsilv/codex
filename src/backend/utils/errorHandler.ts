/**
 * Standardized Error Handler Module
 * Provides unified error handling for the Codex API
 */

/**
 * Custom API Error class with HTTP status code
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details: any;

  constructor(status: number, code: string, message: string, details: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Create a validation error
 * @param message - Error message
 * @param details - Validation error details
 * @returns API Error with 400 status
 */
export function createValidationError(message: string, details: any = null): ApiError {
  return new ApiError(400, 'VALIDATION_ERROR', message, details);
}

/**
 * Create a not found error
 * @param resource - Resource that wasn't found
 * @param id - Resource identifier
 * @returns API Error with 404 status
 */
export function createNotFoundError(resource: string, id: string | null = null): ApiError {
  const message = id
    ? `${resource} with ID ${id} not found`
    : `${resource} not found`;

  return new ApiError(404, 'NOT_FOUND', message);
}

/**
 * Create an unauthorized error
 * @param message - Error message
 * @returns API Error with 401 status
 */
export function createUnauthorizedError(message: string = 'Authentication required'): ApiError {
  return new ApiError(401, 'UNAUTHORIZED', message);
}

/**
 * Create a forbidden error
 * @param message - Error message
 * @returns API Error with 403 status
 */
export function createForbiddenError(message: string = 'Permission denied'): ApiError {
  return new ApiError(403, 'FORBIDDEN', message);
}

/**
 * Create a conflict error
 * @param message - Error message
 * @returns API Error with 409 status
 */
export function createConflictError(message: string): ApiError {
  return new ApiError(409, 'CONFLICT', message);
}

/**
 * Create a server error
 * @param message - Error message
 * @param details - Error details (not exposed to client)
 * @returns API Error with 500 status
 */
export function createServerError(
  message: string = 'Internal server error',
  details: any = null
): ApiError {
  console.error('Server error:', message, details);
  return new ApiError(500, 'SERVER_ERROR', 'An internal server error occurred');
}

/**
 * Interface for custom error handlers
 */
interface ErrorHandlers {
  [key: string]: (error: Error) => ApiError;
}

/**
 * Safely execute a function and handle errors
 * @param fn - Function to execute
 * @param errorHandlers - Custom error handlers
 * @returns Result of the function
 * @throws ApiError - Standardized API error
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandlers: ErrorHandlers = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    // If it's already an ApiError, just rethrow it
    if (error instanceof ApiError) {
      throw error;
    }

    // Check for specific error types and use custom handlers
    if (error instanceof Error) {
      for (const [errorType, handler] of Object.entries(errorHandlers)) {
        if (error instanceof Error && 
            (error.constructor.name === errorType || error.name === errorType)) {
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
    } else {
      // Handle non-Error objects
      throw createServerError('An unexpected error occurred', { error });
    }
  }
}