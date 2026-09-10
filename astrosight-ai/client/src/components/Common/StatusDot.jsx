import React from 'react';

export default function StatusDot({ 
  active = true, 
  variant = 'green', // Options: 'green', 'blue', 'amber', 'rose'
  ping = true,       // Toggles the pulsing halo effect
  className = '' 
}) {
  const colorMap = {
    green: {
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
    },
    blue: {
      dot: 'bg-sky-500',
      ping: 'bg-sky-400',
    },
    amber: {
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
    },
    rose: {
      dot: 'bg-rose-500',
      ping: 'bg-rose-400',
    },
  };

  const selectedColor = colorMap[variant] || colorMap.green;

  return (
    <span className={`relative flex h-2.5 w-2.5 items-center justify-center ${className}`}>
      {active && ping && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${selectedColor.ping}`}
        />
      )}
      <span
        className={`relative inline-flex h-2 w-2 rounded-full transition-colors duration-200 ${
          active ? selectedColor.dot : 'bg-slate-600'
        }`}
      />
    </span>
  );
}