import React from 'react';

export default function Badge({ 
  children, 
  variant = 'blue', // Options: 'blue', 'purple', 'green', 'amber', 'rose'
  className = '' 
}) {
  const variantStyles = {
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const selectedVariant = variantStyles[variant] || variantStyles.blue;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${selectedVariant} ${className}`}
    >
      {children}
    </span>
  );
}