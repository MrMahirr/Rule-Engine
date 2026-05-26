import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  count?: number;
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', className = '', count = 1 }: SkeletonProps) {
  const elements = Array.from({ length: count }, (_, i) => (
    <div 
      key={i} 
      className={`skeleton-loader ${className}`} 
      style={{ width, height, borderRadius, marginBottom: count > 1 && i !== count - 1 ? '0.5rem' : 0 }}
    />
  ));

  return <>{elements}</>;
}
