import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-badge">NETRA-GP</span>
        <div>
          <h1 className="brand-title">NETRA-GP Intelligence Command</h1>
          <p className="brand-subtitle">Networked Ecosystem for Traffic & Reconnaissance Analytics (~80,000 Camera Scalability Model)</p>
        </div>
      </div>

      <nav className="nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🌐 GIS Command Map
        </button>
        <button 
          className={`tab-btn ${activeTab === 'videowall' ? 'active' : ''}`}
          onClick={() => setActiveTab('videowall')}
        >
          📹 Live Video Wall
        </button>
        <button 
          className={`tab-btn ${activeTab === 'registry' ? 'active' : ''}`}
          onClick={() => setActiveTab('registry')}
        >
          📹 Camera Registry
        </button>
        <button 
          className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          🚨 Watchlist DB
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          🔍 Vehicle Route Tracker
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="status-pill status-active">
          <span className="status-dot"></span>
          ANPR ENGINE ONLINE
        </div>
      </div>
    </header>
  );
}
