import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, Button } from '../components';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((val: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) resolvePromise(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) resolvePromise(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <Modal 
          isOpen={isOpen} 
          onClose={handleCancel} 
          title={options.title}
          width="400px"
          footer={
            <>
              <Button variant="ghost" onClick={handleCancel}>{options.cancelText || 'İptal'}</Button>
              <Button 
                variant={options.isDestructive ? 'primary' : 'primary'} 
                style={options.isDestructive ? { backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white', textShadow: 'none', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' } : {}}
                onClick={handleConfirm}
              >
                {options.confirmText || 'Onayla'}
              </Button>
            </>
          }
        >
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {options.message}
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
}
