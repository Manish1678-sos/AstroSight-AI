import React from 'react';

export default function AirmassChart({ selectedAlert }) {
  // Simulates hourly airmass curve data across an observing night
  const airmassData = [
    { time: '20:00', airmass: 2.8, alt: 21 },
    { time: '21:00', airmass: 2.1, alt: 28 },
    { time: '22:00', airmass: 1.6, alt: 38 },
    { time: '23:00', airmass: 1.2, alt: 56 },
    { time: '00:00', airmass: 1.05, alt: 72 }, // Meridian transit
    { time: '01:00', airmass: 1.2, alt: 56 },
    { time: '02:00', airmass: 1.6, alt: 38 },
    { time: '03:00', airmass: 2.1, alt: 28 },
    { time: '04:00', airmass: 2.9, alt: 20 },
  ];

  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          // AIRMASS & ALTITUDE CURVE
        </span>
        <span className="text-[10px] text-emerald-400 font-bold">
          OPTIMAL WINDOW: 22:00 - 02:00
        </span>
      </div>

      {/* Airmass / Horizon Threshold Bar Visualization */}
      <div className="space-y-2 py-1">
        {airmassData.map((point, idx) => {
          const isOptimal = point.airmass <= 1.6;
          const isVisible = point.airmass <= 2.0;

          return (
            <div key={idx} className="flex items-center gap-3 text-[10px]">
              <span className="w-10 text-slate-400">{point.time}</span>

              {/* Progress bar mapping altitude (0° to 90°) */}
              <div className="flex-1 h-2 bg-slate-950 rounded overflow-hidden border border-slate-800/80 relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOptimal
                      ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                      : isVisible
                      ? 'bg-amber-400'
                      : 'bg-rose-500/50'
                  }`}
                  style={{ width: `${(point.alt / 90) * 100}%` }}
                />
              </div>

              <div className="w-20 text-right flex justify-end gap-2">
                <span className="text-slate-400">{point.alt}°</span>
                <span
                  className={`font-bold ${
                    isOptimal
                      ? 'text-sky-400'
                      : isVisible
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  X={point.airmass.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[9px] text-slate-500">
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Optimal (X &lt; 1.6)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Observable (X &lt; 2.0)
          </span>
        </div>
        <span>LIMIT: X=2.0</span>
      </div>
    </div>
  );
}