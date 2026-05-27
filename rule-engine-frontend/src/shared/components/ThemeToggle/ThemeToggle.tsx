import React from 'react';
import { useTheme } from '../../hooks';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Light Mode (Açık Tema)' : 'Dark Mode (Koyu Tema)'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
