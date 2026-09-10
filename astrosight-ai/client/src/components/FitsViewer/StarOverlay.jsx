import React, { useState } from 'react';

export default function StarOverlay({ onToggleCatalog }) {
  const [showGaia, setShowGaia] = useState(true);
  const [showAstrometry, setShowAstrometry] = useState(true);
  const [showComparisonStars, setShowComparisonStars] = useState(false);

  const toggleLayer = (setter, current, name) => {
    const nextState = !current;
    setter(nextState);
    if (onToggleCatalog) onToggleCatalog(name, nextState);
  };

  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3 font-mono">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          // CELESTIAL CATALOG OVERLAYS
        </span>
        <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
      </div>

      <div className="space-y-2 text-[11px]">
        {/* Gaia DR3 Catalog Layer */}
        <label className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showGaia}
              onChange={() => toggleLayer(setShowGaia, showGaia, 'gaia')}
              className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
            />
            <span className="text-slate-200">Gaia DR3 Reference Stars</span>
          </div>
          <span className="text-[9px] text-sky-400 font-bold">G &lt; 20.5m</span>
        </label>

        {/* Astrometric Reticle Layer */}
        <label className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAstrometry}
              onChange={() => toggleLayer(setShowAstrometry, showAstrometry, 'astrometry')}
              className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
            />
            <span className="text-slate-200">FOV Grid & Crosshairs</span>
          </div>
          <span className="text-[9px] text-slate-500">RA/DEC</span>
        </label>

        {/* Photometric Comparison Stars */}
        <label className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showComparisonStars}
              onChange={() => toggleLayer(setShowComparisonStars, showComparisonStars, 'compStars')}
              className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
            />
            <span className="text-slate-200">Comparison Stars (Calib)</span>
          </div>
          <span className="text-[9px] text-purple-400 font-bold">3 SELECTED</span>
        </label>
      </div>
    </div>
  );
}