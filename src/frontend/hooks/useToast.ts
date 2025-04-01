import { useContext } from 'preact/hooks';
import { ToastContext } from '../context/ToastContext';

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

export default function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
