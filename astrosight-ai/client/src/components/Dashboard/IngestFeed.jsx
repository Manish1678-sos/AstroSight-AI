import React from 'react';
import GlassCard from '../Common/GlassCard';

export default function IngestFeed() {
  const stats = [
    { label: 'ALERTS / 24H', value: '2,481', sub: '+12.4% vs avg' },
    { label: 'CLASSIFIER PRECISION', value: '96.2%', sub: 'Dual-Head LightGBM+CNN' },
    { label: 'HIGH PRIORITY QUEUE', value: '07', sub: 'Targeted for telescope dispatch' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {stats.map((stat, idx) => (
        <GlassCard key={idx} className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          </div>

          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {stat.value}
            </span>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              {stat.sub}
            </p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}