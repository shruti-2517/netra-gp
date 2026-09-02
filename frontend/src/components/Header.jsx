import React, { useState, useEffect } from 'react';
import { Shield, Map, Video, Database, AlertOctagon, Route, Clock } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      {/* Brand Identity */}
      <div className="brand">
        <div style={{
          background: '#0284c7',
          padding: '6px 8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">NETRA-GP</span>
            <span className="brand-badge">GUJARAT POLICE</span>
          </div>
          <p className="brand-subtitle">Networked Ecosystem for Traffic & Reconnaissance Analytics</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <Map size={15} /> GIS Command Map
        </button>
        <button 
          className={`tab-btn ${activeTab === 'videowall' ? 'active' : ''}`}
          onClick={() => setActiveTab('videowall')}
        >
          <Video size={15} /> Live Video Wall
        </button>
        <button 
          className={`tab-btn ${activeTab === 'registry' ? 'active' : ''}`}
          onClick={() => setActiveTab('registry')}
        >
          <Database size={15} /> Camera Registry
        </button>
        <button 
          className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          <AlertOctagon size={15} /> Watchlist DB
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          <Route size={15} /> Vehicle Route Trace
        </button>
      </nav>

      {/* System Telemetry & Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div className="status-pill status-active">
          <span className="status-dot"></span>
          <span>5 Cameras Active</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '5px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: '#94a3b8',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Clock size={14} />
          <span>{timeStr || '16:10:00 IST'}</span>
        </div>
      </div>
    </header>
  );
}
