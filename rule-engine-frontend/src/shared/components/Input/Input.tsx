import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <input 
        ref={ref}
        className={`input-field ${error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''} ${className}`}
        {...props} 
      />
      {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
    </div>
    );
  }
);

Input.displayName = 'Input';
