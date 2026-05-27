import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);
    
    if (options.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, options.duration || 3000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) => addToast({ title, description, type: 'success' }), [addToast]);
  const error = useCallback((title: string, description?: string) => addToast({ title, description, type: 'error' }), [addToast]);
  const warning = useCallback((title: string, description?: string) => addToast({ title, description, type: 'warning' }), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border border-border-subtle bg-surface-elevated animate-[fadeIn_0.3s_ease-out_forwards]
              ${toast.type === 'success' ? 'border-l-4 border-l-green-500' : ''}
              ${toast.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
              ${toast.type === 'warning' ? 'border-l-4 border-l-yellow-500' : ''}
            `}
            style={{ width: '300px' }}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle className="text-green-500" size={18} />}
              {toast.type === 'error' && <XCircle className="text-red-500" size={18} />}
              {toast.type === 'warning' && <AlertTriangle className="text-yellow-500" size={18} />}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-semibold text-text-primary text-sm">{toast.title}</span>
              {toast.description && <span className="text-text-secondary text-sm">{toast.description}</span>}
            </div>
            <button 
              className="text-text-muted hover:text-text-primary transition-colors"
              onClick={() => removeToast(toast.id)}
            >
              <X size={16} />
            </button>
          </div>
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
