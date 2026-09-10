import React from 'react';

export default function GlassCard({ 
  children, 
  className = '', 
  glow = false,
  onClick
}) {
  return (
    <section 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border border-slate-800/80 
        bg-slate-900/40 backdrop-blur-md 
        shadow-lg transition-all duration-200
        ${glow ? 'border-sky-500/30 shadow-sky-500/5' : ''}
        ${onClick ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-900/60' : ''}
        ${className}
      `}
    >
      {children}
    </section>
  );
}