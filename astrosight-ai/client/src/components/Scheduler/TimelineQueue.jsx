import React from 'react';

export default function TimelineQueue({ schedule = [] }) {
  // Default scheduled execution sequence matching observatory dispatch format
  const defaultSchedule = [
    { id: 'ZTF26aabxq', start: '22:00', duration: '20m', filter: 'r', status: 'completed', alt: 56 },
    { id: 'ZTF26aabwn', start: '22:20', duration: '15m', filter: 'g', status: 'active', alt: 64 },
    { id: 'ZTF26aabpd', start: '22:35', duration: '30m', filter: 'i', status: 'queued', alt: 48 },
    { id: 'ZTF26aabtc', start: '23:05', duration: '15m', filter: 'r', status: 'queued', alt: 38 },
  ];

  const items = schedule.length > 0 ? schedule : defaultSchedule;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="text-sky-400 font-bold animate-pulse">// EXECUTING</span>;
      case 'completed':
        return <span className="text-emerald-400 font-bold">// DONE</span>;
      default:
        return <span className="text-slate-500">// QUEUED</span>;
    }
  };

  const getFilterColor = (filter) => {
    switch (filter) {
      case 'g': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'r': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'i': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px]">
        <span className="text-slate-400 uppercase tracking-wider">// TIMELINE & EXECUTION QUEUE</span>
        <span className="text-sky-400 font-bold">AUTO-SCHEDULER RUNNING</span>
      </div>

      <div className="space-y-2">
        {items.map((slot, index) => {
          const isActive = slot.status === 'active';

          return (
            <div
              key={slot.id || index}
              className={`p-2 rounded border transition-all flex items-center justify-between ${
                isActive
                  ? 'border-sky-500/80 bg-sky-950/30 shadow-md shadow-sky-500/5'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-bold w-10">
                  {slot.start}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{slot.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getFilterColor(slot.filter)}`}>
                      {slot.filter}-band
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    Duration: {slot.duration} | Alt: {slot.alt}°
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-right">
                {getStatusBadge(slot.status)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-1 flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-800/80">
        <span>TOTAL DISPATCH TIME: 1h 20m</span>
        <span className="text-slate-400">DISPATCH ALGORITHM: OPTIMAL AIRMASS</span>
      </div>
    </div>
  );
}