import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
  glowColor?: 'blue' | 'purple' | 'cyan';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glowOnHover = false,
  glowColor = 'blue',
  onClick 
}) => {
  const getGlowStyles = () => {
    if (!glowOnHover) return '';
    switch(glowColor) {
      case 'blue': return 'hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      case 'purple': return 'hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]';
      case 'cyan': return 'hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]';
      default: return 'hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    }
  };

  const glowStyles = getGlowStyles();
  const clickableClass = onClick ? 'cursor-pointer hover:bg-surface-secondary' : '';

  return (
    <div 
      className={`card ${glowStyles} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
