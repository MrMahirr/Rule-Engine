import React, { forwardRef, InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={`rule-engine-input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <input 
          ref={ref}
          className={`rule-engine-input ${error ? 'has-error' : ''}`}
          {...props}
        />
        {error && <span className="input-error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
