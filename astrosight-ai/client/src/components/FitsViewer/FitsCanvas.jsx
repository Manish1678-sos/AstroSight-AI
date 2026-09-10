import React, { useRef, useEffect, useState } from 'react';

export default function FitsCanvas({ selectedAlert }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [coords, setCoords] = useState({ x: 0, y: 0, val: 0 });

  // Simulates drawing FITS optical star cutout with dynamic point source
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background (astronomical sky background noise)
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, width, height);

    // Draw background noise simulation
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const alpha = Math.random() * 0.15;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(rx, ry, 1, 1);
    }

    // Draw central target transient source (Gaussian star profile)
    const centerX = width / 2;
    const centerY = height / 2;
    const gradient = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, 28 * zoom);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(56, 189, 248, 0.8)');
    gradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Draw target reticle crosshairs
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY);
    ctx.lineTo(centerX + 15, centerY);
    ctx.moveTo(centerX, centerY - 15);
    ctx.lineTo(centerX, centerY + 15);
    ctx.stroke();

  }, [zoom, selectedAlert]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    // Simulates dynamic pixel intensity reading
    const val = Math.floor(Math.max(0, 4000 - Math.hypot(x - 150, y - 150) * 25));
    setCoords({ x, y, val });
  };

  return (
    <div className="flex flex-col items-center p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono">
      <div className="w-full flex justify-between items-center pb-2 border-b border-slate-800 text-[10px]">
        <span className="text-slate-400">// FITS CANVAS MATRIX (63x63 CUTOUT)</span>
        <div className="flex gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
          >
            -
          </button>
          <span className="text-sky-400 font-bold">{zoom.toFixed(2)}x</span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
          >
            +
          </button>
        </div>
      </div>

      <div className="relative my-3 border border-slate-700/80 rounded overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onMouseMove={handleMouseMove}
          className="block"
        />
      </div>

      <div className="w-full grid grid-cols-3 gap-2 text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
        <div>X: <span className="text-slate-200 font-bold">{coords.x}px</span></div>
        <div>Y: <span className="text-slate-200 font-bold">{coords.y}px</span></div>
        <div>VAL: <span className="text-sky-400 font-bold">{coords.val} ADU</span></div>
      </div>
    </div>
  );
}