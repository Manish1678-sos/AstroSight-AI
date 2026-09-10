import React, { useState } from 'react';

export default function ContrastStretch({ onStretchChange }) {
  const [scale, setScale] = useState('log');
  const [blackPoint, setBlackPoint] = useState(10);
  const [whitePoint, setWhitePoint] = useState(99);

  const handleScaleChange = (newScale) => {
    setScale(newScale);
    if (onStretchChange) onStretchChange({ scale: newScale, blackPoint, whitePoint });
  };

  const handleSliderChange = (type, val) => {
    const numVal = Number(val);
    if (type === 'black') {
      setBlackPoint(numVal);
      if (onStretchChange) onStretchChange({ scale, blackPoint: numVal, whitePoint });
    } else {
      setWhitePoint(numVal);
      if (onStretchChange) onStretchChange({ scale, blackPoint, whitePoint: numVal });
    }
  };

  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3 font-mono">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">// STRETCH & CONTRAST</span>
        <span className="text-[10px] text-sky-400 font-bold">{scale.toUpperCase()}</span>
      </div>

      {/* Stretch Algorithm Selector */}
      <div className="grid grid-cols-4 gap-1">
        {['linear', 'log', 'asinh', 'sqrt'].map((algo) => (
          <button
            key={algo}
            onClick={() => handleScaleChange(algo)}
            className={`py-1 text-[10px] font-bold rounded uppercase transition-all ${
              scale === algo
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {algo}
          </button>
        ))}
      </div>

      {/* Sliders for Black and White points */}
      <div className="space-y-2 pt-1 text-[10px]">
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>BLACK LEVEL (CUTOFF)</span>
            <span className="text-slate-200 font-bold">{blackPoint}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={blackPoint}
            onChange={(e) => handleSliderChange('black', e.target.value)}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>WHITE LEVEL (SATURATION)</span>
            <span className="text-slate-200 font-bold">{whitePoint}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={whitePoint}
            onChange={(e) => handleSliderChange('white', e.target.value)}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>
      </div>
    </div>
  );
}