import React, { useState, useEffect } from 'react';

// Live alert dataset with target light curve parameters and classification probabilities
const ALERTS_DATA = [
  {
    id: 'ZTF26aabxq',
    type: 'SN CANDIDATE',
    time: '00:04:12',
    dotColor: 'gold',
    topPrediction: 'TYPE IA SUPERNOVA',
    filter: 'G',
    cadence: '30s',
    predictions: [
      { label: 'TYPE IA SUPERNOVA', score: 96.8, color: '#38bdf8' },
      { label: 'NEUTRON STAR MERGER', score: 2.1, color: '#75829a' },
      { label: 'VARIABLE STAR', score: 1.1, color: '#75829a' },
    ],
    points: [[225, 171], [292, 105], [338, 70], [395, 28], [440, 38], [560, 90]],
    pathD: 'M42 193 C120 190 170 187 225 171 S292 105 338 70 S395 28 440 38 S510 85 560 90 S620 82 690 78',
    areaD: 'M42 193 C120 190 170 187 225 171 S292 105 338 70 S395 28 440 38 S510 85 560 90 S620 82 690 78 V225 H42Z',
  },
  {
    id: 'ZTF26aabwm',
    type: 'NEO CANDIDATE',
    time: '00:03:48',
    dotColor: 'green',
    topPrediction: 'NEAR EARTH OBJECT',
    filter: 'R',
    cadence: '15s',
    predictions: [
      { label: 'NEAR EARTH OBJECT', score: 91.4, color: '#38bdf8' },
      { label: 'MAIN BELT ASTEROID', score: 6.2, color: '#75829a' },
      { label: 'COMETARY CANDIDATE', score: 2.4, color: '#75829a' },
    ],
    points: [[150, 200], [250, 160], [340, 110], [420, 80], [510, 130], [600, 180]],
    pathD: 'M42 210 C100 205 180 180 250 160 S340 110 420 80 S510 130 600 180 S650 200 690 205',
    areaD: 'M42 210 C100 205 180 180 250 160 S340 110 420 80 S510 130 600 180 S650 200 690 205 V225 H42Z',
  },
  {
    id: 'ZTF26aabtc',
    type: 'VARIABLE STAR',
    time: '00:02:31',
    dotColor: 'green',
    topPrediction: 'RR LYRAE VARIABLE',
    filter: 'G',
    cadence: '45s',
    predictions: [
      { label: 'RR LYRAE VARIABLE', score: 88.7, color: '#38bdf8' },
      { label: 'DELTA SCUTI', score: 8.5, color: '#75829a' },
      { label: 'ECLIPSING BINARY', score: 2.8, color: '#75829a' },
    ],
    points: [[120, 150], [220, 60], [320, 150], [420, 60], [520, 150], [620, 60]],
    pathD: 'M42 150 Q 120 40 220 150 T 420 150 T 620 150 L 690 100',
    areaD: 'M42 150 Q 120 40 220 150 T 420 150 T 620 150 L 690 100 V225 H42Z',
  },
  {
    id: 'ZTF26aabpd',
    type: 'SN CANDIDATE',
    time: '00:01:09',
    dotColor: 'gold',
    topPrediction: 'TYPE II SUPERNOVA',
    filter: 'I',
    cadence: '60s',
    predictions: [
      { label: 'TYPE II SUPERNOVA', score: 94.1, color: '#38bdf8' },
      { label: 'TYPE IBC SUPERNOVA', score: 4.6, color: '#75829a' },
      { label: 'NOVA CANDIDATE', score: 1.3, color: '#75829a' },
    ],
    points: [[200, 180], [280, 130], [350, 50], [450, 90], [550, 140], [640, 170]],
    pathD: 'M42 200 C110 195 180 185 280 130 S350 50 450 90 S550 140 640 170 S670 180 690 185',
    areaD: 'M42 200 C110 195 180 185 280 130 S350 50 450 90 S550 140 640 170 S670 180 690 185 V225 H42Z',
  },
  {
    id: 'ZTF26aabjk',
    type: 'MOVING OBJECT',
    time: '00:00:44',
    dotColor: 'red',
    topPrediction: 'FAST TRANSIENT',
    filter: 'R',
    cadence: '10s',
    predictions: [
      { label: 'FAST TRANSIENT', score: 98.2, color: '#38bdf8' },
      { label: 'SATELLITE GLINT', score: 1.2, color: '#75829a' },
      { label: 'COSMIC RAY HIT', score: 0.6, color: '#75829a' },
    ],
    points: [[100, 210], [200, 200], [300, 40], [400, 210], [500, 215], [600, 220]],
    pathD: 'M42 215 L200 200 L300 40 L400 210 L690 220',
    areaD: 'M42 215 L200 200 L300 40 L400 210 L690 220 V225 H42Z',
  },
];

function LightCurve({ activeAlert }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">LIGHT CURVE // {activeAlert.id}</span>
        <span className="tag cyan">REAL-TIME</span>
      </div>
      <div className="panel-body">
        <div className="plot-wrap">
          <svg viewBox="0 0 700 245" preserveAspectRatio="none">
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#00f0ff" stopOpacity=".18" />
                <stop offset="1" stopColor="#00f0ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[25, 75, 125, 175, 225].map((y) => (
              <line key={y} x1="42" x2="690" y1={y} y2={y} className="plot-grid" />
            ))}
            {[100, 230, 360, 490, 620].map((x) => (
              <line key={x} x1={x} x2={x} y1="15" y2="225" className="plot-grid" />
            ))}
            <text x="4" y="28" className="axis">18.0</text>
            <text x="4" y="128" className="axis">19.5</text>
            <text x="4" y="228" className="axis">21.0</text>
            <text x="48" y="242" className="axis">-4</text>
            <text x="340" y="242" className="axis">0</text>
            <text x="655" y="242" className="axis">+4 DAY</text>

            <path className="plot-area" d={activeAlert.areaD} />
            <path className="plot-line" d={activeAlert.pathD} />
            {activeAlert.points.map(([cx, cy], idx) => (
              <circle key={idx} cx={cx} cy={cy} r="4" className="plot-point" />
            ))}
          </svg>
        </div>
        <div className="legend">
          <span><i />OBSERVED MAGNITUDE</span>
          <span className="muted">FILTER: {activeAlert.filter}</span>
          <span className="muted">CADENCE: {activeAlert.cadence}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [selected, setSelected] = useState(0);
  const [ingestCount, setIngestCount] = useState(2481);
  const [elapsedSeconds, setElapsedSeconds] = useState(4);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= 10) {
          setIngestCount((count) => count + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeAlert = ALERTS_DATA[selected];

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">01 / TRANSIENT INGEST CENTER</div>
          <h1>Live Detection Feed</h1>
          <p>Automated alert triage from the northern sky survey array.</p>
        </div>
        <div className="heading-meta">
          LAST INGEST <b>00:00:{String(elapsedSeconds).padStart(2, '0')} AGO</b>
          <br />
          PIPELINE <b>10 HZ / NOMINAL</b>
        </div>
      </div>

      <div className="summary">
        <div className="panel">
          <div className="panel-body">
            <div className="metric">{ingestCount.toLocaleString()}</div>
            <div className="metric-label">ALERTS / 24H</div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <div className="metric cyan">96.2%</div>
            <div className="metric-label">CLASSIFIER PRECISION</div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <div className="metric gold">07</div>
            <div className="metric-label">HIGH PRIORITY QUEUE</div>
          </div>
        </div>
      </div>

      <div className="grid dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">INCOMING ALERTS</span>
            <span className="tag">LIVE</span>
          </div>
          <div className="panel-body" style={{ padding: '7px' }}>
            <div className="alert-list">
              {ALERTS_DATA.map((a, i) => (
                <button
                  className={'alert-row ' + (i === selected ? 'selected' : '')}
                  onClick={() => setSelected(i)}
                  key={a.id}
                >
                  <i className={'status-dot ' + (a.dotColor === 'green' ? 'green-dot' : '')} />
                  <div>
                    <div className="alert-name">{a.id}</div>
                    <div className="alert-type">{a.type}</div>
                  </div>
                  <span className="alert-time">{a.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <LightCurve activeAlert={activeAlert} />

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">CLASSIFIER OUTPUT</span>
            <span className="tag cyan">{activeAlert.id}</span>
          </div>
          <div className="panel-body">
            <div className="eyebrow" style={{ marginTop: 4 }}>TOP PREDICTION</div>
            <div style={{ font: '600 19px JetBrains Mono', margin: '5px 0 17px' }}>
              {activeAlert.topPrediction}
            </div>

            {activeAlert.predictions.map((pred, index) => (
              <React.Fragment key={index}>
                <div className={`classify-option ${index === 0 ? 'selected' : ''}`}>
                  <strong>{pred.label}</strong>
                  <span className="confidence" style={{ color: pred.color }}>
                    {pred.score.toFixed(1)}%
                  </span>
                </div>
                {index === 0 && (
                  <div className="bar">
                    <span style={{ width: `${pred.score}%` }} />
                  </div>
                )}
              </React.Fragment>
            ))}

            <button
              className="btn"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => setShowModal(true)}
            >
              OPEN FULL ANALYSIS →
            </button>
          </div>
        </div>
      </div>

      {/* Styled Target Analysis Modal Overlay */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="panel"
            style={{
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div className="panel-header" style={{ justifyContent: 'space-between' }}>
              <span className="panel-title">// TARGET ANALYSIS PANEL — {activeAlert.id}</span>
              <button
                onClick={() => setShowModal(false)}
                className="muted"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                }}
              >
                [✕ CLOSE]
              </button>
            </div>

            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="eyebrow">DETAILED TARGET COMPUTATIONS</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="classify-option" style={{ justifyContent: 'space-between', padding: '10px 12px' }}>
                  <span className="muted" style={{ fontSize: '11px' }}>CLASSIFICATION</span>
                  <strong className="cyan">{activeAlert.topPrediction}</strong>
                </div>

                <div className="classify-option" style={{ justifyContent: 'space-between', padding: '10px 12px' }}>
                  <span className="muted" style={{ fontSize: '11px' }}>FILTER / CADENCE</span>
                  <span>{activeAlert.filter}-band / {activeAlert.cadence}</span>
                </div>

                <div className="classify-option" style={{ justifyContent: 'space-between', padding: '10px 12px' }}>
                  <span className="muted" style={{ fontSize: '11px' }}>PEAK MAGNITUDE</span>
                  <span className="gold">18.42 mag</span>
                </div>

                <div className="classify-option" style={{ justifyContent: 'space-between', padding: '10px 12px' }}>
                  <span className="muted" style={{ fontSize: '11px' }}>REDSHIFT (z) ESTIMATE</span>
                  <span>0.042 ± 0.003</span>
                </div>

                <div className="classify-option" style={{ justifyContent: 'space-between', padding: '10px 12px' }}>
                  <span className="muted" style={{ fontSize: '11px' }}>STATUS</span>
                  <span style={{ color: '#4ade80', fontWeight: 'bold' }}>READY FOR DISPATCH</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  className="btn"
                  style={{ flex: 1, textAlign: 'center' }}
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  DISPATCH TO SCHEDULER →
                </button>
                <button
                  className="btn"
                  style={{
                    background: 'transparent',
                    borderColor: '#2a364f',
                    color: '#75829a',
                  }}
                  onClick={() => setShowModal(false)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}