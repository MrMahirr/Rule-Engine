import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
      <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <div className="relative">
          <select 
            ref={ref}
            className={`input-field appearance-none cursor-pointer pr-10 ${error ? 'border-red-500' : ''}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
      </div>
    );
  }
);

SelectBox.displayName = 'SelectBox';
