import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    const getVariantClass = (v: ButtonVariant) => {
      switch (v) {
        case 'primary': return 'btn-primary';
        case 'secondary': return 'btn-secondary';
        case 'ghost': return 'btn-ghost';
        case 'danger': return 'btn-danger';
        default: return 'btn-primary';
      }
    };

    const getSizeClass = (s: ButtonSize) => {
      switch (s) {
        case 'sm': return 'btn-sm';
        case 'md': return 'btn-md';
        case 'lg': return 'btn-lg';
        default: return 'btn-md';
      }
    };

    const classes = [
      'rule-engine-btn',
      getVariantClass(variant),
      getSizeClass(size),
      isLoading ? 'is-loading' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <button 
        ref={ref} 
        className={classes} 
        disabled={disabled || isLoading} 
        {...props}
      >
        {isLoading && <span className="btn-spinner"></span>}
        <span className="btn-content">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
