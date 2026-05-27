import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
}

export function useKeyboardShortcuts({ onSave, onUndo, onRedo, onCopy, onPaste }: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Ctrl + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave?.();
      }

      // Ctrl + Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          onUndo?.();
        }
      }

      // Ctrl + Y or Ctrl + Shift + Z (Redo)
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        if (!isInput) {
          e.preventDefault();
          onRedo?.();
        }
      }

      // Ctrl + C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (!isInput) {
          onCopy?.();
        }
      }

      // Ctrl + V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (!isInput) {
          onPaste?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onUndo, onRedo, onCopy, onPaste]);
}
