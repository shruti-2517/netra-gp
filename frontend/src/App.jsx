import React, { useState } from 'react';
import Header from './components/Header';
import GisMap from './components/GisMap';
import VideoWall from './components/VideoWall';
import CameraRegistry from './components/CameraRegistry';
import WatchlistManager from './components/WatchlistManager';
import RouteTracker from './components/RouteTracker';
import AlertFeed from './components/AlertFeed';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="main-content">
        {activeTab === 'map' && <GisMap />}
        {activeTab === 'videowall' && <VideoWall />}
        {activeTab === 'registry' && <CameraRegistry />}
        {activeTab === 'watchlist' && <WatchlistManager />}
        {activeTab === 'tracking' && <RouteTracker />}

        <AlertFeed />
      </div>
    </div>
  );
}
