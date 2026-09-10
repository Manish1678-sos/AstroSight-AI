import React, { useState } from 'react';

export default function PrioritySlider({ 
  initialValue = 75, 
  onPriorityChange 
}) {
  const [priority, setPriority] = useState(initialValue);

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setPriority(val);
    if (onPriorityChange) onPriorityChange(val);
  };

  // Helper styling based on urgency level
  const getPriorityInfo = (val) => {
    if (val >= 80) return { label: 'CRITICAL (DISPATCH IMMEDIATE)', color: 'text-rose-400', bar: 'bg-rose-500' };
    if (val >= 50) return { label: 'HIGH (NEXT SCHEDULED SLOT)', color: 'text-amber-400', bar: 'bg-amber-500' };
    return { label: 'STANDARD (BACKGROUND QUEUE)', color: 'text-sky-400', bar: 'bg-sky-500' };
  };

  const currentInfo = getPriorityInfo(priority);

  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px]">
        <span className="text-slate-400 uppercase tracking-wider">// SCHEDULING PRIORITY WEIGHT</span>
        <span className={`font-bold ${currentInfo.color}`}>{priority}/100</span>
      </div>

      <div className="pt-1">
        <input
          type="range"
          min="1"
          max="100"
          value={priority}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500 border border-slate-800"
        />
      </div>

      <div className="flex justify-between items-center text-[9px] pt-1">
        <span className="text-slate-500">LEVEL:</span>
        <span className={`font-semibold ${currentInfo.color}`}>{currentInfo.label}</span>
      </div>
    </div>
  );
}