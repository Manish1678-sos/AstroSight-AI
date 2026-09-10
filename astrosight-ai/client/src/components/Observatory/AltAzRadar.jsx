import React, { useRef, useEffect } from 'react';

export default function AltAzRadar({ targets = [] }) {
  const canvasRef = useRef(null);

  // Default targets if no custom array is passed
  const defaultTargets = [
    { id: 'ZTF26aabxq', alt: 72, az: 145, type: 'SN' },
    { id: 'ZTF26aabwn', alt: 38, az: 210, type: 'NEO' },
    { id: 'ZTF26aabtc', alt: 25, az: 45, type: 'VAR' },
  ];

  const radarTargets = targets.length > 0 ? targets : defaultTargets;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Draw Radar Concentric Circles (Altitude: 0°, 30°, 60°)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1].forEach((scale) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Compass Axis Lines (N-S, E-W)
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Cardinal Labels
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N (0°)', centerX, centerY - radius - 5);
    ctx.fillText('S (180°)', centerX, centerY + radius + 12);
    ctx.fillText('E (90°)', centerX + radius + 18, centerY + 3);
    ctx.fillText('W (270°)', centerX - radius - 18, centerY + 3);

    // Plot Targets on Radar Canvas
    radarTargets.forEach((target) => {
      // Map Altitude (90° = center, 0° = outer edge)
      const r = radius * (1 - target.alt / 90);
      // Map Azimuth angle to radians (0° = North = -90° in standard canvas space)
      const theta = ((target.az - 90) * Math.PI) / 180;

      const x = centerX + r * Math.cos(theta);
      const y = centerY + r * Math.sin(theta);

      // Target Blip Glow
      ctx.fillStyle = target.type === 'SN' ? '#c084fc' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label Overlay
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px monospace';
      ctx.fillText(target.id, x + 8, y + 3);
    });
  }, [radarTargets]);

  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono flex flex-col items-center space-y-2">
      <div className="w-full flex justify-between items-center pb-1 border-b border-slate-800 text-[10px]">
        <span className="text-slate-400">// ALT-AZ RADAR POSITION MAP</span>
        <span className="text-sky-400 font-bold">REAL-TIME HORIZON</span>
      </div>

      <canvas
        ref={canvasRef}
        width={260}
        height={260}
        className="block my-1"
      />

      <div className="w-full flex justify-around text-[9px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400" /> Supernova
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-400" /> NEO Target
        </span>
      </div>
    </div>
  );
}