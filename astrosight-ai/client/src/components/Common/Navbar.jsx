import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'live', label: '01 // LIVE FEED' },
    { id: 'radar', label: '02 // OBSERVATORY RADAR' },
    { id: 'fits', label: '03 // FITS STUDIO' },
    { id: 'scheduler', label: '04 // SCHEDULER' },
  ];

  return (
    <nav className="flex gap-2 px-6 py-2 bg-slate-900/60 border-b border-slate-800">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab && setActiveTab(item.id)}
          className={`px-4 py-1.5 text-xs font-mono font-semibold rounded transition-all ${
            activeTab === item.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}