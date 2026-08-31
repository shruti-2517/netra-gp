import React, { useState } from 'react';
import Header from './components/Header';
import GisMap from './components/GisMap';
import AlertFeed from './components/AlertFeed';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        {activeTab === 'map' && <GisMap />}
        {activeTab === 'videowall' && (
          <div style={{ flex: 1, padding: 24, color: '#8a99ad', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [ Multi-Camera Grid Video Wall - 4 Feeds Active ]
          </div>
        )}
        {activeTab === 'registry' && (
          <div style={{ flex: 1, padding: 24, color: '#8a99ad', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [ Camera Metadata Registry & Bulk Import View ]
          </div>
        )}
        {activeTab === 'watchlist' && (
          <div style={{ flex: 1, padding: 24, color: '#8a99ad', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [ Watchlist Database Management & Hotlist Vehicles ]
          </div>
        )}
        {activeTab === 'tracking' && (
          <div style={{ flex: 1, padding: 24, color: '#8a99ad', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [ Vehicle Route History & Spatial Timeline Reconstruction ]
          </div>
        )}

        <AlertFeed />
      </div>
    </div>
  );
}
