import { h, JSX } from 'preact';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  onClose?: () => void;
}

export default function Toast({
  message,
  type = 'info',
  onClose,
}: ToastProps): JSX.Element {
  const getTypeClasses = (): string => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-md border-l-4 max-w-sm ${getTypeClasses()}`}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium">{message}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
