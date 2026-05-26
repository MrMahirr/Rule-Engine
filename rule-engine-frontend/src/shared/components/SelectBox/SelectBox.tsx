import React, { SelectHTMLAttributes, forwardRef } from 'react';
import './SelectBox.css';

export interface Option {
  value: string;
  label: string;
}

export interface SelectBoxProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  fullWidth?: boolean;
}

export const SelectBox = forwardRef<HTMLSelectElement, SelectBoxProps>(
  ({ label, options, error, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={`rule-engine-select-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        {label && <label className="select-label">{label}</label>}
        <div className="select-input-container">
          <select 
            ref={ref}
            className={`rule-engine-select ${error ? 'has-error' : ''}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="select-option">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="select-arrow">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {error && <span className="select-error">{error}</span>}
      </div>
    );
  }
);

SelectBox.displayName = 'SelectBox';
