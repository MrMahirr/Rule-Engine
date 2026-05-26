import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastProps, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Individual Toast Message Component
function ToastMessage({ toast, onClose }: { toast: ToastProps; onClose: (id: string) => void }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onClose(toast.id), 300); // Wait for animation
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.duration, toast.id, onClose]);

  const handleManualClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  return (
    <div className={`toast toast-${toast.type} ${isClosing ? 'toast-closing' : ''}`}>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.description && <div className="toast-desc">{toast.description}</div>}
      </div>
      <button className="toast-close" onClick={handleManualClose}>✕</button>
    </div>
  );
}

// Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) => addToast({ title, description, type: 'success' }), [addToast]);
  const error = useCallback((title: string, description?: string) => addToast({ title, description, type: 'error' }), [addToast]);
  const info = useCallback((title: string, description?: string) => addToast({ title, description, type: 'info' }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastMessage key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
