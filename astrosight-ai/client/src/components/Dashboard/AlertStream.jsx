import React from 'react';
import Badge from '../Common/Badge';
import StatusDot from '../Common/StatusDot';

export default function AlertStream({ 
  alerts = [], 
  selectedAlert, 
  onSelectAlert 
}) {
  // Default mock alerts matching the ZTF transient stream format if no props are passed
  const defaultAlerts = [
    { id: 'ZTF26aabxq', type: 'SN CANDIDATE', time: '00:00:12', confidence: 96.8, priority: 'high' },
    { id: 'ZTF26aabwn', type: 'NEO CANDIDATE', time: '00:01:45', confidence: 91.2, priority: 'medium' },
    { id: 'ZTF26aabtc', type: 'VARIABLE STAR', time: '00:02:31', confidence: 88.4, priority: 'low' },
    { id: 'ZTF26aabpd', type: 'SN CANDIDATE', time: '00:03:09', confidence: 94.1, priority: 'high' },
    { id: 'ZTF26aabjk', type: 'MOVING OBJECT', time: '00:05:44', confidence: 82.5, priority: 'low' },
  ];

  const streamData = alerts.length > 0 ? alerts : defaultAlerts;

  const getBadgeVariant = (type) => {
    if (type.includes('SN')) return 'purple';
    if (type.includes('NEO') || type.includes('MOVING')) return 'blue';
    return 'green';
  };

  const getStatusDotVariant = (priority) => {
    if (priority === 'high') return 'amber';
    if (priority === 'medium') return 'blue';
    return 'green';
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <h3 className="text-[11px] font-mono text-slate-400 tracking-wider">
          // INCOMING ALERTS
        </h3>
        <span className="text-[10px] font-mono text-slate-500">LIVE FEED</span>
      </div>

      <div className="space-y-1.5 overflow-y-auto max-h-[480px] pr-1">
        {streamData.map((alert) => {
          const isSelected = selectedAlert?.id === alert.id;

          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert && onSelectAlert(alert)}
              className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-950/30 shadow-md shadow-sky-500/10'
                  : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <StatusDot 
                  active={true} 
                  variant={getStatusDotVariant(alert.priority)} 
                  ping={alert.priority === 'high'} 
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                      {alert.id}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    <Badge variant={getBadgeVariant(alert.type)}>
                      {alert.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block">
                  {alert.time}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {alert.confidence}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}