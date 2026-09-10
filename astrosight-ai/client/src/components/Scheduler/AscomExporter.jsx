import React, { useState } from 'react';

export default function AscomExporter({ targets = [] }) {
  const [copied, setCopied] = useState(false);

  // Default targets payload if none passed via props
  const defaultTargets = [
    { id: 'ZTF26aabxq', ra: '12:43:18.2', dec: '+15:22:40', expTime: 120, filter: 'r' },
    { id: 'ZTF26aabwn', ra: '14:02:11.5', dec: '-04:11:18', expTime: 180, filter: 'g' },
  ];

  const exportTargets = targets.length > 0 ? targets : defaultTargets;

  // Generates JSON script for ASCOM / Alpaca driver sequence execution
  const generateAscomScript = () => {
    return JSON.stringify(
      {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        observatory: 'UEMK-01',
        sequence: exportTargets.map((t, index) => ({
          step: index + 1,
          targetId: t.id,
          rightAscension: t.ra,
          declination: t.dec,
          exposureTimeSec: t.expTime || 120,
          filter: t.filter || 'r',
          action: 'TRACK_AND_IMAGE',
        })),
      },
      null,
      2
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateAscomScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          // ASCOM / ALPACA SCRIPT EXPORTER
        </span>
        <span className="text-[10px] text-sky-400 font-bold">DRIVER READY</span>
      </div>

      <div className="relative">
        <pre className="p-2.5 bg-slate-950 border border-slate-800/80 rounded text-[10px] text-slate-300 overflow-x-auto max-h-40 leading-relaxed font-mono">
          {generateAscomScript()}
        </pre>
      </div>

      <div className="flex justify-between items-center pt-1">
        <span className="text-[9px] text-slate-500">
          {exportTargets.length} TARGET(S) IN QUEUE
        </span>
        <button
          onClick={handleCopy}
          className={`px-3 py-1 text-xs rounded transition-all font-semibold ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
          }`}
        >
          {copied ? 'COPIED TO CLIPBOARD!' : 'EXPORT SCRIPT'}
        </button>
      </div>
    </div>
  );
}