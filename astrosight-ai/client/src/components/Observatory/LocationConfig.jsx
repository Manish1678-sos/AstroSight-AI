import React, { useState } from 'react';

export default function LocationConfig({ onConfigChange }) {
  const [config, setConfig] = useState({
    siteName: 'UEMK-01 (Kolkata Station)',
    lat: '22.5726',
    lon: '88.3639',
    elevation: '9',
    timezone: 'UTC+5:30',
  });

  const handleChange = (field, value) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    if (onConfigChange) onConfigChange(updated);
  };

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    let newConfig = { ...config };

    if (preset === 'uemk') {
      newConfig = { siteName: 'UEMK-01 (Kolkata Station)', lat: '22.5726', lon: '88.3639', elevation: '9', timezone: 'UTC+5:30' };
    } else if (preset === 'hanle') {
      newConfig = { siteName: 'IAO Hanle (Himalayan Chandra)', lat: '32.7794', lon: '78.9642', elevation: '4500', timezone: 'UTC+5:30' };
    } else if (preset === 'palomar') {
      newConfig = { siteName: 'Palomar Observatory (ZTF)', lat: '33.3563', lon: '-116.8650', elevation: '1706', timezone: 'UTC-7:00' };
    }

    setConfig(newConfig);
    if (onConfigChange) onConfigChange(newConfig);
  };

  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          // OBSERVATORY LOCATION & TELEMETRY
        </span>
        <span className="text-[10px] text-sky-400 font-bold">GPS LOCKED</span>
      </div>

      {/* Preset Station Selector */}
      <div>
        <label className="text-[10px] text-slate-500 uppercase block mb-1">
          LOCATION PRESET
        </label>
        <select
          onChange={handlePresetChange}
          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="uemk">UEMK-01 (Kolkata Station)</option>
          <option value="hanle">IAO Hanle (Himalayan Chandra)</option>
          <option value="palomar">Palomar Observatory (ZTF)</option>
        </select>
      </div>

      {/* Input Coordinates Form */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="text-slate-500 block mb-0.5">LATITUDE (°N)</span>
          <input
            type="text"
            value={config.lat}
            onChange={(e) => handleChange('lat', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="text-slate-500 block mb-0.5">LONGITUDE (°E)</span>
          <input
            type="text"
            value={config.lon}
            onChange={(e) => handleChange('lon', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="text-slate-500 block mb-0.5">ELEVATION (m)</span>
          <input
            type="text"
            value={config.elevation}
            onChange={(e) => handleChange('elevation', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="text-slate-500 block mb-0.5">TIMEZONE</span>
          <input
            type="text"
            value={config.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}