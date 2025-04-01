import { createContext } from 'preact';
import { useState } from 'preact/hooks';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const value = {
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
