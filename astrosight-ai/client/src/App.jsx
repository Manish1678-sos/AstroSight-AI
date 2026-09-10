import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Radio, Telescope, ScanSearch, CalendarClock, Wifi, Bell, Command } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import ObservatoryPage from './pages/ObservatoryPage';
import FitsStudioPage from './pages/FitsStudioPage';
import SchedulePage from './pages/SchedulePage';
import TargetAnalysisModel from './components/TargetAnalysisModel';

const navItems = [
  { to: '/', label: 'LIVE FEED', icon: Radio, code: '01' },
  { to: '/observatory', label: 'OBSERVATORY RADAR', icon: Telescope, code: '02' },
  { to: '/fits-studio', label: 'FITS STUDIO', icon: ScanSearch, code: '03' },
  { to: '/schedule', label: 'SCHEDULER', icon: CalendarClock, code: '04' },
];

function Navbar() {
  const location = useLocation();
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-mark"><Command size={18} /></div>
        <div>
          <strong>ASTROSIGHT <span>AI</span></strong>
          <small>TRANSIENT OPERATIONS // UEMK-01</small>
        </div>
      </div>
      <nav>
        {navItems.map(({ to, label, icon: Icon, code }) => (
          <NavLink key={to} to={to} className={location.pathname === to ? 'active' : ''}>
            <span className="nav-code">{code}</span>
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="system-state"><Wifi size={14} /><span>LINKED</span><i /></div>
    </header>
  );
}

function TopBar() {
  const [utc, setUtc] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setUtc(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="topbar">
      <span><Activity size={13} /> SYSTEM NOMINAL</span>
      <span>UTC {utc.toISOString().slice(11, 19)}</span>
      <span>LAT 22.5726° N&nbsp;&nbsp; LON 88.3639° E</span>
      <span className="top-alert"><Bell size={13} /> 3 UNREAD ALERTS</span>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [activeModalTarget, setActiveModalTarget] = useState(null);
  const [dispatchedTargets, setDispatchedTargets] = useState([]);

  // Handles dispatching a target from modal -> scheduler queue
  const handleDispatchToScheduler = (target) => {
    const newQueueItem = {
      id: String(Date.now()).slice(-4),
      time: new Date().toISOString().substring(11, 16) + ' UTC',
      name: target.name || 'ZTF26aabxq',
      type: target.classification || 'TYPE IA SUPERNOVA',
      duration: target.cadence || '00:30',
      az: '142°',
      priority: 'HIGH',
      status: 'PENDING',
    };

    setDispatchedTargets((prev) => [newQueueItem, ...prev]);
    setActiveModalTarget(null);
    navigate('/schedule'); // Redirect to Scheduler page immediately
  };

  return (
    <>
      <Navbar />
      <TopBar />
      <main>
        <Routes>
          <Route 
            path="/" 
            element={<DashboardPage onSelectTarget={(target) => setActiveModalTarget(target)} />} 
          />
          <Route path="/observatory" element={<ObservatoryPage />} />
          <Route path="/fits-studio" element={<FitsStudioPage />} />
          <Route 
            path="/schedule" 
            element={<SchedulePage externalTargets={dispatchedTargets} />} 
          />
        </Routes>
      </main>

      {/* Target Inspection & Dispatch Modal */}
      {activeModalTarget && (
        <TargetAnalysisModal
          target={activeModalTarget}
          onClose={() => setActiveModalTarget(null)}
          onDispatchToScheduler={handleDispatchToScheduler}
        />
      )}

      <footer>
        <span>ASTROSIGHT CORE v0.9.4</span>
        <span>STREAM LATENCY <b>84ms</b></span>
        <span>© UEMK SPACE OBSERVATORY</span>
      </footer>
    </>
  );
}