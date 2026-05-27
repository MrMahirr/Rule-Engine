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
        case 'primary': return 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue hover:text-space-900 shadow-[0_0_5px_rgba(14,165,233,0.1)] hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]';
        case 'secondary': return 'bg-surface-elevated border border-border-subtle text-text-primary hover:bg-surface-secondary hover:border-text-secondary';
        case 'ghost': return 'bg-transparent text-text-primary hover:bg-surface-secondary border border-transparent hover:border-border-subtle';
        case 'danger': return 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white shadow-[0_0_5px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]';
        default: return 'bg-surface-elevated text-text-primary';
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
