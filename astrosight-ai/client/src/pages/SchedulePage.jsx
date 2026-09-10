import React, { useState, useEffect } from 'react';

export default function SchedulePage({ externalTargets = [] }) {
  const defaultSchedule = [
    { id: '1', time: '21:14 UTC', name: 'ZTF26aabwm', type: 'NEO CANDIDATE', duration: '00:18', az: '341°', priority: 'HIGH', status: 'PENDING' },
    { id: '2', time: '21:35 UTC', name: 'SN2026x', type: 'TYPE IA SUPERNOVA', duration: '00:42', az: '012°', priority: 'HIGH', status: 'PENDING' },
    { id: '3', time: '22:24 UTC', name: 'M31-NOVA-4', type: 'VARIABLE STAR', duration: '00:30', az: '078°', priority: 'MED', status: 'PENDING' },
    { id: '4', time: '23:02 UTC', name: 'AT2026bq', type: 'TRANSIENT', duration: '00:24', az: '112°', priority: 'MED', status: 'PENDING' },
  ];

  // Merge newly dispatched targets from Live Feed at the top of the queue
  const [schedule, setSchedule] = useState(() => [...externalTargets, ...defaultSchedule]);

  useEffect(() => {
    if (externalTargets.length > 0) {
      setSchedule((prev) => {
        // Prevent duplicate items if state re-renders
        const newItems = externalTargets.filter(
          (ext) => !prev.some((item) => item.name === ext.name && item.time === ext.time)
        );
        return [...newItems, ...prev];
      });
    }
  }, [externalTargets]);

  const [isOptimizing, setIsOptimizing] = useState(false);

  // Dispatch individual queue target to telescope hardware
  const handleDispatch = (id) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'SLEWING' } : item))
    );

    setTimeout(() => {
      setSchedule((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'ACQUIRING' } : item))
      );
    }, 1500);

    setTimeout(() => {
      setSchedule((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'COMPLETED' } : item))
      );
    }, 4000);
  };

  const handleReoptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setSchedule((prev) => [...prev].reverse());
      setIsOptimizing(false);
    }, 600);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(schedule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'telescope_schedule.json';
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ color: '#00f0ff', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
            04 / SLEW OPTIMIZATION CORE
          </div>
          <h1 style={{ margin: '4px 0', fontSize: '24px', fontWeight: 'bold' }}>Telescope Scheduler</h1>
          <p className="muted" style={{ fontSize: '12px', color: '#75829a' }}>
            Priority-weighted observation queue for UEMK-01.
          </p>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
          <div style={{ color: '#75829a' }}>
            TONIGHT'S WINDOW <b style={{ color: '#00f0ff' }}>21:00 — 05:12 UTC</b>
          </div>
          <div style={{ color: '#75829a', marginTop: '2px' }}>
            SLEW EFFICIENCY <b style={{ color: '#10b981' }}>87.4%</b>
          </div>
        </div>
      </div>

      {/* Control Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#040914', padding: '12px 16px', borderRadius: '4px', border: '1px solid #1d283a' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn"
            onClick={handleReoptimize}
            disabled={isOptimizing}
            style={{ padding: '6px 14px', fontSize: '11px', fontFamily: 'JetBrains Mono', cursor: 'pointer' }}
          >
            {isOptimizing ? 'OPTIMIZING...' : '↻ RE-OPTIMIZE'}
          </button>
          <button
            onClick={exportJSON}
            style={{ background: 'transparent', border: '1px solid #1d283a', color: '#00f0ff', padding: '6px 12px', borderRadius: '2px', fontSize: '11px', fontFamily: 'JetBrains Mono', cursor: 'pointer' }}
          >
            ↓ EXPORT .JSON
          </button>
        </div>
        <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#75829a' }}>
          AUTO-OPTIMIZED: <b style={{ color: '#fff' }}>{schedule.length} TARGETS</b>
        </div>
      </div>

      {/* Observation Timeline Grid */}
      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1d283a' }}>
          <span className="panel-title" style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#00f0ff' }}>
            // OBSERVATION TIMELINE
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#75829a' }}>SLEW MODEL: GREEDY / PRIORITY</span>
        </div>

        <div className="panel-body" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {schedule.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: item.status === 'SLEWING' || item.status === 'ACQUIRING' ? 'rgba(0, 240, 255, 0.05)' : '#020617',
                border: `1px solid ${item.status === 'SLEWING' || item.status === 'ACQUIRING' ? '#00f0ff' : '#1d283a'}`,
                padding: '12px 16px',
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono',
              }}
            >
              {/* Left Column: Time & Index */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '130px' }}>
                <span style={{ color: '#75829a', fontSize: '12px', width: '16px' }}>#{idx + 1}</span>
                <span style={{ color: '#00f0ff', fontSize: '13px', fontWeight: 'bold' }}>{item.time}</span>
              </div>

              {/* Target Name and Type */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>{item.name}</span>
                <span style={{ fontSize: '10px', background: 'rgba(29, 40, 58, 0.6)', color: '#94a3b8', padding: '2px 6px', borderRadius: '2px', border: '1px solid #1d283a' }}>
                  {item.type}
                </span>
              </div>

              {/* Details & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  EXPOSURE: <b style={{ color: '#fff' }}>{item.duration}</b>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  AZ: <b style={{ color: '#fff' }}>{item.az || '142°'}</b>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '2px',
                    fontWeight: 'bold',
                    background: item.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: item.priority === 'HIGH' ? '#ef4444' : '#f59e0b',
                    border: `1px solid ${item.priority === 'HIGH' ? '#ef4444' : '#f59e0b'}`,
                  }}
                >
                  {item.priority || 'HIGH'}
                </span>

                <button
                  onClick={() => handleDispatch(item.id)}
                  disabled={item.status !== 'PENDING'}
                  style={{
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontFamily: 'JetBrains Mono',
                    cursor: item.status === 'PENDING' ? 'pointer' : 'default',
                    background: '#00f0ff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '2px',
                    minWidth: '100px',
                  }}
                >
                  {item.status === 'PENDING' && 'DISPATCH ➔'}
                  {item.status === 'SLEWING' && 'SLEWING...'}
                  {item.status === 'ACQUIRING' && 'EXPOSING...'}
                  {item.status === 'COMPLETED' && '✓ EXPOSED'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}