import React, { useState, useEffect } from 'react';
import StatusDot from './StatusDot';

export default function TopBar() {
  const [utcTime, setUtcTime] = useState('');

  // Keeps the UTC timestamp running in real-time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-slate-950 border-b border-slate-800 text-[11px] font-mono select-none">
      {/* Left: System Status & Telemetry */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <StatusDot active={true} variant="green" ping={true} />
          <span className="text-emerald-400 font-bold tracking-wider">SYSTEM NOMINAL</span>
        </div>

        <div className="text-slate-400 border-l border-slate-800 pl-4">
          TIME: <span className="text-slate-200">{utcTime || '12:00:00 UTC'}</span>
        </div>

        <div className="text-slate-400 border-l border-slate-800 pl-4 hidden md:block">
          OBSERVATORY: <span className="text-slate-200">UEMK-01</span> 
          <span className="text-slate-500 ml-2">(LAT 22.5726° N, LON 88.3639° E)</span>
        </div>
      </div>

      {/* Right: Unread Alerts & Connection Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>3 UNREAD ALERTS</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-4">
          <span>STREAM:</span>
          <span className="text-sky-400 font-bold">LINKED</span>
        </div>
      </div>
    </header>
  );
}