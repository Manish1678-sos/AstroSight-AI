import React from 'react';
import GlassCard from '../Common/GlassCard';
import Badge from '../Common/Badge';

export default function TransientSummary({ selectedAlert }) {
  // Fallback candidate if no alert is selected
  const alert = selectedAlert || {
    id: 'ZTF26aabxq',
    type: 'SN CANDIDATE',
    topPrediction: 'TYPE IA SUPERNOVA',
    confidence: 96.8,
    breakdown: [
      { label: 'TYPE IA SUPERNOVA', score: 96.8, variant: 'purple' },
      { label: 'NEUTRON STAR MERGER', score: 2.1, variant: 'blue' },
      { label: 'VARIABLE STAR', score: 1.1, variant: 'green' },
    ],
  };

  return (
    <GlassCard className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">
            // CLASSIFIER OUTPUT
          </span>
          <span className="font-mono text-xs font-bold text-sky-400">
            {alert.id}
          </span>
        </div>

        {/* Top Prediction Highlight */}
        <div className="mt-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
            TOP PREDICTION
          </span>
          <h2 className="text-xl font-mono font-bold text-slate-100 mt-0.5">
            {alert.topPrediction || 'TYPE IA SUPERNOVA'}
          </h2>
        </div>

        {/* Prediction Probabilities Breakdown */}
        <div className="mt-4 space-y-2">
          {(alert.breakdown || [
            { label: 'TYPE IA SUPERNOVA', score: 96.8, variant: 'purple' },
            { label: 'NEUTRON STAR MERGER', score: 2.1, variant: 'blue' },
            { label: 'VARIABLE STAR', score: 1.1, variant: 'green' },
          ]).map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">{item.label}</span>
                <span className="text-sky-400 font-bold">{item.score}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.variant === 'purple' ? 'bg-purple-500' :
                    item.variant === 'blue' ? 'bg-sky-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-3 border-t border-slate-800/80">
        <button 
          onClick={() => alert('Opening spectral & light-curve breakdown...')}
          className="w-full py-2 px-3 text-xs font-mono font-semibold rounded border border-slate-700 bg-slate-800/60 text-slate-200 hover:border-sky-500 hover:text-sky-400 transition-all"
        >
          OPEN FULL ANALYSIS &rarr;
        </button>
      </div>
    </GlassCard>
  );
}