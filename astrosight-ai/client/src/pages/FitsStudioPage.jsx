import React, { useState, useRef } from 'react';

export default function FitsStudioPage() {
  const [stretch, setStretch] = useState('LOG');
  const [grid, setGrid] = useState(true);
  const [catalog, setCatalog] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [blackPoint, setBlackPoint] = useState(18);
  const [whitePoint, setWhitePoint] = useState(72);
  const [cursorCoords, setCursorCoords] = useState({ ra: '00:42:44.31', dec: '+41:16:08.2', flux: '1,204 ADU' });
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef(null);

  // Crosshair readout calculations
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const raSec = (44.31 + (x - 200) * 0.02).toFixed(2);
    const decSec = (8.2 + (200 - y) * 0.02).toFixed(1);
    const simulatedFlux = Math.floor(800 + Math.random() * 400 + (x % 50) * 15);

    setCursorCoords({
      ra: `00:42:${raSec < 10 ? '0' : ''}${raSec}`,
      dec: `+41:16:${decSec < 10 ? '0' : ''}${decSec}`,
      flux: `${simulatedFlux.toLocaleString()} ADU`,
    });
  };

  // Astronomical stretch styling math
  const getStarStyle = (index) => {
    const baseSize = 2 + (index % 4);
    const baseBrightness = 0.3 + ((index * 13) % 70) / 100;

    let adjustedSize = baseSize;
    let adjustedOpacity = baseBrightness;
    let glowRadius = 0;

    if (stretch === 'LINEAR') {
      adjustedOpacity = Math.min(1, Math.max(0, (baseBrightness - blackPoint / 100) * (100 / (whitePoint - blackPoint + 1))));
      glowRadius = adjustedOpacity > 0.6 ? 2 : 0;
    } else if (stretch === 'LOG') {
      const logVal = Math.log10(1 + baseBrightness * 9);
      adjustedOpacity = Math.min(1, logVal * (100 / Math.max(1, whitePoint)));
      adjustedSize = baseSize * 1.45;
      glowRadius = 6 + (index % 3) * 3;
    } else if (stretch === 'SQRT') {
      const sqrtVal = Math.sqrt(baseBrightness);
      adjustedOpacity = Math.min(1, sqrtVal * (100 / Math.max(1, whitePoint)));
      adjustedSize = baseSize * 1.2;
      glowRadius = 3 + (index % 2) * 2;
    }

    return {
      position: 'absolute',
      left: `${8 + (index * 37) % 84}%`,
      top: `${8 + (index * 53) % 80}%`,
      width: `${adjustedSize}px`,
      height: `${adjustedSize}px`,
      backgroundColor: index % 5 === 0 ? '#38bdf8' : '#ffffff',
      borderRadius: '50%',
      opacity: adjustedOpacity,
      boxShadow: glowRadius > 0 ? `0 0 ${glowRadius}px #00f0ff` : 'none',
      transition: 'all 0.25s ease-out',
    };
  };

  // Full HTML5 Canvas-based PNG Export Engine
  const handleExportPNG = () => {
    setIsExporting(true);

    setTimeout(() => {
      const exportCanvas = document.createElement('canvas');
      const w = 800;
      const h = 600;
      exportCanvas.width = w;
      exportCanvas.height = h;
      const ctx = exportCanvas.getContext('2d');

      // 1. Draw Space Background
      ctx.fillStyle = stretch === 'LOG' ? '#030816' : '#02050e';
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Faint LOG Stretch Nebulosity Glow
      if (stretch === 'LOG') {
        const bgGlow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 300);
        bgGlow.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
        bgGlow.addColorStop(1, 'rgba(3, 8, 22, 0)');
        ctx.fillStyle = bgGlow;
        ctx.fillRect(0, 0, w, h);
      }

      // 3. Draw Coordinate Grid Lines
      if (grid) {
        ctx.strokeStyle = 'rgba(29, 40, 58, 0.6)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= w; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y <= h; y += 60) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // 4. Render Stars
      for (let i = 0; i < 36; i++) {
        const x = ((8 + (i * 37) % 84) / 100) * w;
        const y = ((8 + (i * 53) % 80) / 100) * h;
        const style = getStarStyle(i);
        const radius = parseFloat(style.width) / 2;

        if (style.opacity > 0.05) {
          ctx.save();
          ctx.globalAlpha = style.opacity;

          // Star Glow
          if (style.boxShadow !== 'none') {
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
          }

          ctx.fillStyle = i % 5 === 0 ? '#38bdf8' : '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 5. Draw Catalog Annotations
      if (catalog) {
        ctx.font = '10px "JetBrains Mono", monospace';

        // M31-V1 marker
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.45 - 9, h * 0.35 - 9, 18, 18);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('M31-V1', w * 0.45 - 9, h * 0.35 - 14);

        // GAIA marker
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(w * 0.72, h * 0.6, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('GAIA-782', w * 0.72 - 14, h * 0.6 - 12);
      }

      // 6. Draw Header Overlay
      ctx.fillStyle = 'rgba(4, 9, 20, 0.85)';
      ctx.fillRect(0, 0, w, 40);
      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(`FITS Export: ztf_20260910_0314.fits | STRETCH: ${stretch}`, 15, 25);

      // Trigger Download
      const link = document.createElement('a');
      link.download = `ztf_20260910_0314_${stretch.toLowerCase()}_stretch.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();

      setIsExporting(false);
    }, 400);
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">03 / RAW IMAGE INSPECTION</div>
          <h1>FITS Inspection Studio</h1>
          <p>Deep-field calibration frame // M31 sector // g-band.</p>
        </div>
        <div className="heading-meta">
          FILE <b>ztf_20260910_0314.fits</b>
          <br />
          SIZE <b>4096 × 4096 px</b>
        </div>
      </div>

      <div className="grid dashboard-grid" style={{ gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Main Image Viewport Panel */}
        <div className="panel fits-canvas-panel">
          <div className="panel-header" style={{ justifyContent: 'space-between' }}>
            <span className="panel-title">// IMAGE VIEWPORT</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                STRETCH: <b style={{ color: '#00f0ff' }}>{stretch}</b>
              </span>
              <span className="tag green">CALIBRATED</span>
            </div>
          </div>

          <div
            className="panel-body"
            style={{
              padding: '0',
              position: 'relative',
              overflow: 'hidden',
              background: stretch === 'LOG' ? '#030816' : '#02050e',
              minHeight: '420px',
              transition: 'background 0.3s ease',
            }}
            onMouseMove={handleMouseMove}
            ref={canvasRef}
          >
            <div
              className="starfield"
              style={{
                position: 'relative',
                width: '100%',
                height: '420px',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
            >
              {Array.from({ length: 36 }, (_, i) => (
                <i key={i} style={getStarStyle(i)} />
              ))}

              {stretch === 'LOG' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 50% 40%, rgba(0, 240, 255, 0.08) 0%, rgba(3, 8, 22, 0) 65%)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {catalog && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: '45%',
                      top: '35%',
                      border: '1px solid #00f0ff',
                      width: '18px',
                      height: '18px',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '2px',
                    }}
                  >
                    <span style={{ position: 'absolute', top: '-14px', left: '0', fontSize: '9px', color: '#00f0ff', fontFamily: 'JetBrains Mono' }}>
                      M31-V1
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: '72%',
                      top: '60%',
                      border: '1px dashed #f59e0b',
                      width: '14px',
                      height: '14px',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                    }}
                  >
                    <span style={{ position: 'absolute', top: '-14px', left: '0', fontSize: '9px', color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
                      GAIA-782
                    </span>
                  </div>
                </>
              )}

              <div
                className="crosshair"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '20px',
                  height: '20px',
                  transform: 'translate(-50%, -50%)',
                  border: '1px stroke rgba(0,240,255,0.3)',
                }}
              />

              {grid && (
                <div
                  className="coord-grid"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'linear-gradient(to right, rgba(29, 40, 58, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(29, 40, 58, 0.4) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    opacity: 1,
                  }}
                />
              )}
            </div>

            <div
              className="canvas-footer"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(3, 7, 18, 0.85)',
                backdropFilter: 'blur(4px)',
                padding: '8px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                borderTop: '1px solid #1d283a',
              }}
            >
              <span>RA <b style={{ color: '#fff' }}>{cursorCoords.ra}</b></span>
              <span>DEC <b style={{ color: '#fff' }}>{cursorCoords.dec}</b></span>
              <span>FLUX <b style={{ color: '#38bdf8' }}>{cursorCoords.flux}</b></span>
              <span>ZOOM <b style={{ color: '#00f0ff' }}>{zoom}%</b></span>
            </div>
          </div>
        </div>

        {/* Stretch Controls Panel */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">// STRETCH CONTROLS</span>
          </div>

          <div className="panel-body controls" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '8px' }}>STRETCH ALGORITHM</div>
              <div
                className="segmented"
                style={{
                  display: 'flex',
                  gap: '4px',
                  background: '#040914',
                  padding: '3px',
                  borderRadius: '4px',
                  border: '1px solid #1d283a',
                }}
              >
                {['LINEAR', 'LOG', 'SQRT'].map((x) => (
                  <button
                    key={x}
                    onClick={() => setStretch(x)}
                    className={stretch === x ? 'selected' : ''}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      background: stretch === x ? '#00f0ff' : 'transparent',
                      color: stretch === x ? '#000' : '#75829a',
                      border: 'none',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">BLACK POINT</span>
                  <span style={{ color: '#00f0ff' }}>{blackPoint}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={blackPoint}
                  onChange={(e) => setBlackPoint(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00f0ff' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">WHITE POINT</span>
                  <span style={{ color: '#00f0ff' }}>{whitePoint}</span>
                </div>
                <input
                  type="range"
                  min="51"
                  max="100"
                  value={whitePoint}
                  onChange={(e) => setWhitePoint(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00f0ff' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="control-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                <span className="muted">ZOOM LEVEL</span>
                <strong style={{ color: '#00f0ff' }}>{zoom}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #1d283a', paddingTop: '12px' }}>
              <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                <span className="muted">COORDINATE GRID</span>
                <button
                  onClick={() => setGrid(!grid)}
                  style={{
                    background: grid ? 'rgba(0,240,255,0.15)' : 'transparent',
                    border: `1px solid ${grid ? '#00f0ff' : '#1d283a'}`,
                    color: grid ? '#00f0ff' : '#75829a',
                    padding: '4px 10px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                >
                  {grid ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                <span className="muted">REFERENCE CATALOG</span>
                <button
                  onClick={() => setCatalog(!catalog)}
                  style={{
                    background: catalog ? 'rgba(0,240,255,0.15)' : 'transparent',
                    border: `1px solid ${catalog ? '#00f0ff' : '#1d283a'}`,
                    color: catalog ? '#00f0ff' : '#75829a',
                    padding: '4px 10px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                >
                  {catalog ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <button
              className="btn"
              onClick={handleExportPNG}
              disabled={isExporting}
              style={{
                width: '100%',
                marginTop: '10px',
                textAlign: 'center',
                opacity: isExporting ? 0.6 : 1,
              }}
            >
              {isExporting ? 'GENERATING PNG...' : 'EXPORT PNG →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}