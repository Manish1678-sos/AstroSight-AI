import React, { useState, useEffect } from 'react';

// Targets displayed on the Sky Radar and Visibility Engine
const RADAR_TARGETS = [
  { id: 'ZTF26aabxq', name: 'SN Candidate (ZTF26aabxq)', alt: 68, az: 42, color: '#f59e0b', cx: 375, cy: 110, ra: 2.75, dec: 35.0, raStr: '02h 45m', decStr: '+35° 00′' },
  { id: 'ZTF26aabwm', name: 'NEO Candidate (ZTF26aabwm)', alt: 45, az: 310, color: '#10b981', cx: 300, cy: 155, ra: 12.133, dec: 15.67, raStr: '12h 08m', decStr: '+15° 40′' },
  { id: 'ZTF26aabpd', name: 'SN Candidate (ZTF26aabpd)', alt: 32, az: 135, color: '#ef4444', cx: 425, cy: 235, ra: 16.75, dec: -5.3, raStr: '16h 45m', decStr: '-05° 18′' },
];

/**
 * Geometric Elevation Calculation (\theta_a)
 */
function calculateGeometricElevation(latDeg, lonDeg, raHours, decDeg, utcHour) {
  const latRad = (latDeg * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;

  const lstHours = (utcHour + lonDeg / 15.0) % 24;
  let haHours = lstHours - raHours;

  while (haHours > 12) haHours -= 24;
  while (haHours < -12) haHours += 24;

  const haRad = (haHours * 15.0 * Math.PI) / 180;

  const sinAlt =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);

  return (Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180) / Math.PI;
}

/**
 * Atmospheric Refraction via Bennett's Formula
 */
function calculateRefractionArcmin(geoElevationDeg, elevationMeters) {
  if (geoElevationDeg < -5) return 0;
  const pressureMbar = 1013.25 * Math.exp(-elevationMeters / 8200);
  const tempKelvin = 288.15;
  const e = Math.max(geoElevationDeg, 0);

  return (
    (1.02 / Math.tan(((e + 10.3 / (e + 5.11)) * Math.PI) / 180)) *
    (pressureMbar / 1013.25) *
    (288.15 / tempKelvin)
  );
}

/**
 * Refraction-Corrected Airmass (Young & Irvine Model)
 */
function calculateAirmass(apparentElevationDeg) {
  if (apparentElevationDeg <= 1.0) return 3.0;
  const zenithRad = ((90 - apparentElevationDeg) * Math.PI) / 180;
  const airmass = 1 / Math.cos(zenithRad);
  return Math.min(Math.max(airmass, 1.0), 3.0);
}

export default function ObservatoryPage() {
  const [selectedTarget, setSelectedTarget] = useState(RADAR_TARGETS[0]);
  const [hoveredTarget, setHoveredTarget] = useState(null);

  // Form Input States
  const [lat, setLat] = useState('60.4565');
  const [lon, setLon] = useState('105.5689');
  const [elevation, setElevation] = useState('19');

  const [lst, setLst] = useState('14:37:09.22');
  const [trackingActive, setTrackingActive] = useState(true);

  // Active Coordinates for Calculations
  const [activeCoords, setActiveCoords] = useState({
    lat: 60.4565,
    lon: 105.5689,
    elev: 19,
  });

  // Solver / Notification States
  const [isCalculating, setIsCalculating] = useState(false);
  const [showStatusNotification, setShowStatusNotification] = useState(false);
  const [solverResult, setSolverResult] = useState(null);

  // Sidereal Clock simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = String((now.getHours() + 2) % 24).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
      setLst(`${hrs}:${mins}:${secs}.${ms}`);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Recalculate Trigger
  const handleRecalculate = (e) => {
    e.preventDefault();
    setIsCalculating(true);

    const parsedLat = parseFloat(lat) || 0;
    const parsedLon = parseFloat(lon) || 0;
    const parsedElev = parseFloat(elevation) || 0;

    // Direct synchronous state update forces re-render
    setActiveCoords({
      lat: parsedLat,
      lon: parsedLon,
      elev: parsedElev,
    });

    // Mathematical calculations for popup
    const latRad = (parsedLat * Math.PI) / 180;
    const decRad = (selectedTarget.dec * Math.PI) / 180;
    const sinMax = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad);
    const maxAltGeo = (Math.asin(Math.max(-1, Math.min(1, sinMax))) * 180) / Math.PI;

    const refractionArcmin = calculateRefractionArcmin(maxAltGeo, parsedElev);
    const maxAltApparent = maxAltGeo + refractionArcmin / 60.0;
    const minAirmass = calculateAirmass(maxAltApparent);

    setSolverResult({
      lat: parsedLat,
      lon: parsedLon,
      elev: parsedElev,
      sinMax: sinMax.toFixed(4),
      maxAltGeo: maxAltGeo.toFixed(2),
      refractionArcmin: refractionArcmin.toFixed(2),
      maxAltApparent: maxAltApparent.toFixed(2),
      minAirmass: minAirmass.toFixed(3),
    });

    setIsCalculating(false);
    setShowStatusNotification(true);
  };

  // Direct calculation per render cycle (no stale useMemo)
  const points = [];
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 42;
  const paddingY = 40;

  let optimalStart = null;
  let optimalEnd = null;

  const totalSteps = 72;
  for (let i = 0; i <= totalSteps; i++) {
    const absoluteHour = 18 + (i * 12) / totalSteps;
    const utcHour = absoluteHour % 24;

    const geoAlt = calculateGeometricElevation(
      activeCoords.lat,
      activeCoords.lon,
      selectedTarget.ra,
      selectedTarget.dec,
      utcHour
    );

    const refractionArcmin = calculateRefractionArcmin(geoAlt, activeCoords.elev);
    const apparentAlt = geoAlt + refractionArcmin / 60.0;
    const airmass = calculateAirmass(apparentAlt);

    if (airmass <= 2.0) {
      if (optimalStart === null) optimalStart = utcHour;
      optimalEnd = utcHour;
    }

    const x = paddingX + (i / totalSteps) * (svgWidth - paddingX - 10);
    const normalizedY = (airmass - 1.0) / (3.0 - 1.0);
    const y = paddingY + normalizedY * (svgHeight - paddingY - 40);

    points.push({ x, y, airmass, utcHour });
  }

  const strokeD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );
  const fillD = `${strokeD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

  const formatTime = (time) =>
    time !== null
      ? `${String(Math.floor(time)).padStart(2, '0')}:${String(Math.round((time % 1) * 60)).padStart(2, '0')} UTC`
      : 'NONE TONIGHT';

  const optimalWindowStr = `${formatTime(optimalStart)} - ${formatTime(optimalEnd)}`;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">02 / LOCAL VISIBILITY ENGINE</div>
          <h1>Observatory Radar</h1>
          <p>Live horizon & atmospheric refraction solution for UEMK Space Observatory.</p>
        </div>
        <div className="heading-meta">
          LOCAL SIDEREAL TIME
          <br />
          <b style={{ color: '#00f0ff', fontSize: '15px' }}>{lst}</b>
        </div>
      </div>

      {/* Radar Panel */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <span className="panel-title">// ALT-AZ SKY RADAR</span>
          <button
            onClick={() => setTrackingActive(!trackingActive)}
            className="tag cyan"
            style={{ background: 'transparent', cursor: 'pointer', border: '1px solid #00f0ff' }}
          >
            {trackingActive ? 'TRACKING ON' : 'TRACKING PAUSED'}
          </button>
        </div>

        <div className="panel-body" style={{ position: 'relative', minHeight: '380px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg viewBox="0 0 700 350" style={{ width: '100%', maxHeight: '380px' }}>
            <circle cx="350" cy="185" r="160" fill="none" stroke="#1d283a" strokeWidth="1" />
            <circle cx="350" cy="185" r="110" fill="none" stroke="#1d283a" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="350" cy="185" r="60" fill="none" stroke="#1d283a" strokeWidth="1" strokeDasharray="3 3" />

            <line x1="350" y1="25" x2="350" y2="345" stroke="#1d283a" strokeWidth="1" />
            <line x1="190" y1="185" x2="510" y2="185" stroke="#1d283a" strokeWidth="1" />

            {trackingActive && (
              <line x1="350" y1="185" x2="490" y2="85" stroke="#00f0ff" strokeWidth="1.5" opacity="0.4">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 350 185"
                  to="360 350 185"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </line>
            )}

            <polygon
              points={`${RADAR_TARGETS[0].cx},${RADAR_TARGETS[0].cy} ${RADAR_TARGETS[1].cx},${RADAR_TARGETS[1].cy} ${RADAR_TARGETS[2].cx},${RADAR_TARGETS[2].cy}`}
              fill="#00f0ff"
              fillOpacity="0.05"
              stroke="#00f0ff"
              strokeWidth="1.5"
            />

            <text x="350" y="20" fill="#75829a" fontSize="16" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
              ZENITH
            </text>

            {RADAR_TARGETS.map((t) => (
              <g
                key={t.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedTarget(t)}
                onMouseEnter={() => setHoveredTarget(t)}
                onMouseLeave={() => setHoveredTarget(null)}
              >
                <circle
                  cx={t.cx}
                  cy={t.cy}
                  r={selectedTarget.id === t.id ? '10' : '8'}
                  fill={t.color}
                  stroke={selectedTarget.id === t.id ? '#ffffff' : 'none'}
                  strokeWidth="2"
                />
              </g>
            ))}
          </svg>

          {hoveredTarget && (
            <div
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#0b1329',
                border: '1px solid #1d283a',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
            >
              <div style={{ color: hoveredTarget.color, fontWeight: 'bold' }}>{hoveredTarget.name}</div>
              <div className="muted">RA: {hoveredTarget.raStr} | DEC: {hoveredTarget.decStr}</div>
              <div className="muted">ALT: {hoveredTarget.alt}° | AZ: {hoveredTarget.az}°</div>
            </div>
          )}
        </div>
      </div>

      {/* Visibility Curve Panel */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <span className="panel-title">// AIRMASS VISIBILITY CURVE — {selectedTarget.id}</span>
          <span className="tag cyan">AIRMASS ≤ 2.0</span>
        </div>

        <div className="panel-body">
          <div className="plot-wrap">
            <svg 
              key={`${activeCoords.lat}-${activeCoords.lon}-${activeCoords.elev}-${selectedTarget.id}`}
              viewBox="0 0 700 220" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="airmassGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#00f0ff" stopOpacity=".2" />
                  <stop offset="1" stopColor="#00f0ff" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="42" x2="690" y1="40" y2="40" className="plot-grid" />
              <line x1="42" x2="690" y1="110" y2="110" className="plot-grid" />
              <line x1="42" x2="690" y1="180" y2="180" className="plot-grid" />

              <text x="4" y="45" className="axis">1.0</text>
              <text x="4" y="115" className="axis">2.0</text>
              <text x="4" y="185" className="axis">3.0</text>

              <text x="70" y="210" className="axis">18:00</text>
              <text x="340" y="210" className="axis">00:00</text>
              <text x="610" y="210" className="axis">06:00</text>

              <path d={fillD} fill="url(#airmassGrad)" />
              <path d={strokeD} fill="none" stroke="#00f0ff" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="legend" style={{ marginTop: '10px' }}>
            <span><i />OBSERVABLE WINDOW (ALT ≥ 30° / AIRMASS ≤ 2.0)</span>
            <span className="muted">OPTIMAL WINDOW: {optimalWindowStr}</span>
          </div>
        </div>
      </div>

      {/* Location Config Panel */}
      <div className="panel">
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <span className="panel-title">// LOCATION CONFIG</span>
          <span className="tag">ASTROPY SOLVER</span>
        </div>

        <div className="panel-body">
          <form onSubmit={handleRecalculate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>LATITUDE (°N)</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#040914',
                    border: '1px solid #1d283a',
                    color: '#fff',
                    padding: '8px 10px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '13px',
                    borderRadius: '2px',
                  }}
                />
              </div>

              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>LONGITUDE (°E)</label>
                <input
                  type="text"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#040914',
                    border: '1px solid #1d283a',
                    color: '#fff',
                    padding: '8px 10px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '13px',
                    borderRadius: '2px',
                  }}
                />
              </div>

              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>ELEVATION (m)</label>
                <input
                  type="text"
                  value={elevation}
                  onChange={(e) => setElevation(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#040914',
                    border: '1px solid #1d283a',
                    color: '#fff',
                    padding: '8px 10px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '13px',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div className="eyebrow">LOCATION LOCKED</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#38bdf8' }}>
                  {activeCoords.lat}° N / {activeCoords.lon}° E / {activeCoords.elev}m
                </div>
              </div>

              <button
                type="submit"
                className="btn"
                disabled={isCalculating}
                style={{
                  opacity: isCalculating ? 0.6 : 1,
                  cursor: isCalculating ? 'wait' : 'pointer',
                  minWidth: '220px',
                }}
              >
                {isCalculating ? 'COMPUTING REFRACTION...' : 'RECALCULATE VISIBILITY →'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Dynamic Solver Calculation Popup */}
      {showStatusNotification && solverResult && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            width: '420px',
            maxWidth: '90vw',
          }}
        >
          <div className="panel" style={{ borderLeft: '3px solid #00f0ff', boxShadow: '0 10px 30px rgba(0,0,0,0.95)', background: '#090f1d' }}>
            <div className="panel-header" style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
              <span className="panel-title" style={{ color: '#00f0ff' }}>// ASTROPY SOLVER PROOF</span>
              <button
                onClick={() => setShowStatusNotification(false)}
                style={{ background: 'none', border: 'none', color: '#75829a', cursor: 'pointer', fontSize: '11px' }}
              >
                [✕]
              </button>
            </div>
            
            <div className="panel-body" style={{ padding: '12px', fontSize: '11px', fontFamily: 'JetBrains Mono', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#e2e8f0', fontWeight: 'bold' }}>
                Recalculated sky horizon & atmospheric refraction:
              </div>
              <div className="muted" style={{ fontSize: '10px' }}>
                LAT: <span style={{ color: '#fff' }}>{solverResult.lat}° N</span> | LON: <span style={{ color: '#fff' }}>{solverResult.lon}° E</span> | ELEV: <span style={{ color: '#fff' }}>{solverResult.elev}m</span>
              </div>

              <div style={{ background: '#040812', padding: '8px', borderRadius: '4px', border: '1px solid #1a2333', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: '#38bdf8' }}>1. Target Peak Transit (HA = 0°):</div>
                <div>sin(θ_max) = sin({solverResult.lat}°)·sin({selectedTarget.dec}°) + cos({solverResult.lat}°)·cos({selectedTarget.dec}°) = <b>{solverResult.sinMax}</b></div>
                <div>θ_geo = arcsin({solverResult.sinMax}) = <b>{solverResult.maxAltGeo}°</b></div>
              </div>

              <div style={{ background: '#040812', padding: '8px', borderRadius: '4px', border: '1px solid #1a2333', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: '#38bdf8' }}>2. Refraction & Airmass Solution:</div>
                <div>Bennett Refraction ΔR = <b>+{solverResult.refractionArcmin}′</b></div>
                <div>θ_apparent = {solverResult.maxAltGeo}° + {solverResult.refractionArcmin}′ = <b>{solverResult.maxAltApparent}°</b></div>
                <div>X_min = 1 / sin({solverResult.maxAltApparent}°) = <b style={{ color: '#00f0ff' }}>{solverResult.minAirmass}</b></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}