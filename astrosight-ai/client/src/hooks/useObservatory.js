import { useState, useEffect, useCallback, useMemo } from 'react';

// Default preset stations for quick astronomical switching
export const PRESETS = {
  UEMK: {
    name: 'UEMK-01 (Kolkata Station)',
    latitude: 22.5726,
    longitude: 88.3639,
    elevation: 14,
    timezone: 'UTC+5:30',
  },
  HANLE: {
    name: 'IAO Hanle (Himalayan Chandra)',
    latitude: 32.7794,
    longitude: 78.9642,
    elevation: 4500,
    timezone: 'UTC+5:30',
  },
  PALOMAR: {
    name: 'Palomar Observatory (ZTF)',
    latitude: 33.3563,
    longitude: -116.8650,
    elevation: 1706,
    timezone: 'UTC-7:00',
  },
};

const STORAGE_KEY = 'astrosight_observatory_config';

export function useObservatory(initial = PRESETS.UEMK) {
  const [location, setLocationState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  const [utcTime, setUtcTime] = useState(new Date());

  // Updates live time tick every second
  useEffect(() => {
    const timer = setInterval(() => setUtcTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Syncs configuration changes to local storage
  const setLocation = useCallback((newConfig) => {
    setLocationState((prev) => {
      const updated = typeof newConfig === 'function' ? newConfig(prev) : newConfig;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist observatory location:', err);
      }
      return updated;
    });
  }, []);

  // Quick preset selector
  const selectPreset = useCallback((presetKey) => {
    if (PRESETS[presetKey]) {
      setLocation(PRESETS[presetKey]);
    }
  }, [setLocation]);

  // Derived Local Sidereal Time (LST) calculation for pointing & airmass calculations
  const lst = useMemo(() => {
    const now = utcTime;
    const jd = (now.getTime() / 86400000) + 2440587.5;
    const d = jd - 2451545.0;
    let gmst = 18.697374558 + 24.06570982441908 * d;
    gmst = gmst % 24;
    if (gmst < 0) gmst += 24;
    
    let lstHours = gmst + (location.longitude / 15.0);
    lstHours = lstHours % 24;
    if (lstHours < 0) lstHours += 24;

    const h = Math.floor(lstHours);
    const m = Math.floor((lstHours - h) * 60);
    const s = Math.floor(((lstHours - h) * 60 - m) * 60);

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [utcTime, location.longitude]);

  return {
    location,
    setLocation,
    selectPreset,
    presets: PRESETS,
    utcTime,
    lst,
  };
}