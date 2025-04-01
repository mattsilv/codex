import { h, createContext, JSX } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import Toast from '../components/ui/Toast';

interface ToastItem {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: 'info' | 'success' | 'error' | 'warning'
  ) => number;
  showSuccess: (message: string) => number;
  showError: (message: string) => number;
  showWarning: (message: string) => number;
  removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: JSX.Element | JSX.Element[] | string;
}

export function ToastProvider({ children }: ToastProviderProps): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Function to remove a toast by ID
  const removeToast = useCallback((id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  // Remove toast after timeout
  useEffect(() => {
    if (toasts.length > 0) {
      const latestToast = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        removeToast(latestToast.id);
      }, 5000); // Auto-remove after 5 seconds

      // Return cleanup function
      return () => clearTimeout(timer);
    }
    // Explicitly return undefined if the if condition is not met
    return undefined;
  }, [toasts, removeToast]);

  // Add a new toast
  const showToast = useCallback(
    (
      message: string,
      type: 'info' | 'success' | 'error' | 'warning' = 'info'
    ): number => {
      const id = Date.now();
      const newToast = { id, message, type };
      setToasts((currentToasts) => [...currentToasts, newToast]);
      return id;
    },
    []
  );

  // Show success toast
  const showSuccess = (message: string): number => {
    return showToast(message, 'success');
  };

  // Show error toast
  const showError = (message: string): number => {
    return showToast(message, 'error');
  };

  // Show warning toast
  const showWarning = (message: string): number => {
    return showToast(message, 'warning');
  };

  // The toast container component
  const ToastContainer = (): JSX.Element | null => {
    if (toasts.length === 0) return null;

    return (
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    );
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
