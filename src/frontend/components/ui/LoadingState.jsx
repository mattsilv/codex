import { h } from 'preact';

export const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClass =
    {
      small: 'w-4 h-4 border-2',
      medium: 'w-8 h-8 border-2',
      large: 'w-12 h-12 border-3',
    }[size] || 'w-8 h-8 border-2';

  return (
    <div
      className={`${sizeClass} rounded-full border-gray-200 border-t-blue-600 animate-spin mx-auto`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const LoadingOverlay = ({ children, loading }) => {
  if (!loading) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10 rounded-inherit">
        <LoadingSpinner size="large" />
      </div>
    </div>
  );
};

export const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="py-4">
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 flex-shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clipRule="evenodd"
          />
        </svg>
        <p>{message}</p>
        {onRetry && (
          <button
            className="ml-auto px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  LoadingSpinner,
  LoadingOverlay,
  ErrorMessage,
};
