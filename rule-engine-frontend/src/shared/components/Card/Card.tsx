import React, { ReactNode } from 'react';
import './Card.css';

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
  const getGlowClass = () => {
    switch(glowColor) {
      case 'blue': return 'glow-blue';
      case 'purple': return 'glow-purple';
      case 'cyan': return 'glow-cyan';
      default: return 'glow-blue';
    }
  };

  const glowClass = glowOnHover ? `glow-hover ${getGlowClass()}` : '';
  const clickableClass = onClick ? 'clickable' : '';

  return (
    <div 
      className={`rule-engine-card ${glowClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
