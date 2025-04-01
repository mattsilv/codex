import { h, createContext, JSX } from 'preact';
import { useState } from 'preact/hooks';

interface Toast {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface AppContextType {
  toast: Toast | null;
  showToast: (
    message: string,
    type?: 'info' | 'success' | 'error' | 'warning'
  ) => void;
}

interface AppProviderProps {
  children: JSX.Element | JSX.Element[] | string;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (
    message: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info'
  ): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const value: AppContextType = {
    toast,
    showToast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '0.25rem',
          }}
        >
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
}
