import React from 'react';

export default function TargetAnalysisModal({ target, onClose, onDispatchToScheduler }) {
  if (!target) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '460px',
        backgroundColor: '#040914',
        border: '1px solid #1d283a',
        borderRadius: '6px',
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: '1px solid #1d283a'
        }}>
          <span style={{ fontSize: '11px', color: '#00f0ff', letterSpacing: '0.5px' }}>
            // TARGET ANALYSIS PANEL — {target.name || 'ZTF26aabxq'}
          </span>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#75829a', cursor: 'pointer', fontSize: '11px' }}
          >
            [× CLOSE]
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '10px', color: '#00f0ff', letterSpacing: '1px' }}>
            DETAILED TARGET COMPUTATIONS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: '#1d283a', border: '1px solid #1d283a', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#020617', fontSize: '11px' }}>
              <span style={{ color: '#75829a' }}>CLASSIFICATION</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{target.classification || 'TYPE IA SUPERNOVA'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#020617', fontSize: '11px' }}>
              <span style={{ color: '#75829a' }}>FILTER / CADENCE</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{target.filterCadence || 'G-band / 30s'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#020617', fontSize: '11px' }}>
              <span style={{ color: '#75829a' }}>PEAK MAGNITUDE</span>
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{target.mag || '18.42 mag'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#020617', fontSize: '11px' }}>
              <span style={{ color: '#75829a' }}>REDSHIFT (z) ESTIMATE</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>0.042 ± 0.003</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#020617', fontSize: '11px' }}>
              <span style={{ color: '#75829a' }}>STATUS</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>READY FOR DISPATCH</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px', padding: '14px 18px', borderTop: '1px solid #1d283a', backgroundColor: '#020617' }}>
          <button
            onClick={() => onDispatchToScheduler(target)}
            style={{
              padding: '10px',
              backgroundColor: '#00f0ff',
              color: '#000',
              border: 'none',
              borderRadius: '2px',
              fontWeight: 'bold',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono',
              cursor: 'pointer'
            }}
          >
            DISPATCH TO SCHEDULER →
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px',
              backgroundColor: 'transparent',
              color: '#75829a',
              border: '1px solid #1d283a',
              borderRadius: '2px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono',
              cursor: 'pointer'
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}