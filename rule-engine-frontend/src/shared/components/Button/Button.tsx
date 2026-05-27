import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, fullWidth, iconOnly, ...props }, ref) => {
    
    const getVariantClass = (v: ButtonVariant) => {
      switch (v) {
        case 'primary': return 'bg-blue-600 text-white hover:bg-blue-700';
        case 'secondary': return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
        case 'ghost': return 'bg-transparent hover:bg-gray-100 text-gray-600';
        case 'danger': return 'bg-red-600 text-white hover:bg-red-700';
        default: return 'bg-blue-600 text-white';
      }
    };

    const getSizeClass = (s: ButtonSize) => {
      switch (s) {
        case 'sm': return 'px-3 py-1 text-sm';
        case 'md': return 'px-4 py-2';
        case 'lg': return 'px-6 py-3 text-lg';
        default: return 'px-4 py-2';
      }
    };

    const baseClass = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClass = getVariantClass(variant);
    const sizeClass = getSizeClass(size);
    const fullWidthClass = fullWidth ? 'w-full' : '';

    const classes = [
      baseClass,
      variantClass,
      sizeClass,
      fullWidthClass,
      isLoading ? 'opacity-70' : '',
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
        <span className="flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
