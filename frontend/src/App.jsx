import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import GisMap from './components/GisMap';
import VideoWall from './components/VideoWall';
import CameraRegistry from './components/CameraRegistry';
import WatchlistManager from './components/WatchlistManager';
import RouteTracker from './components/RouteTracker';
import EvidenceVault from './components/EvidenceVault';
import AlertFeed from './components/AlertFeed';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('map');
  const [wsConnected, setWsConnected] = useState(true);
  const { isTabAllowed, currentRole } = useAuth();

  // Route Access Check
  const hasAccess = isTabAllowed(activeTab);

  return (
    <div className="app-container">
      {/* 1. Slim Top Bar (~46px) */}
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* 2. Left Collapsible Icon Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 3. Main Operational Content Region */}
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', background: '#f7f9fb' }}>
          {hasAccess ? (
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
              {activeTab === 'map' && <GisMap />}
              {activeTab === 'videowall' && <VideoWall />}
              {activeTab === 'registry' && <CameraRegistry />}
              {activeTab === 'watchlist' && <WatchlistManager />}
              {activeTab === 'tracking' && <RouteTracker />}
              {activeTab === 'evidence' && <EvidenceVault />}
            </div>
          ) : (
            /* Access Restricted View for RBAC */
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
              background: '#f7f9fb'
            }}>
              <div style={{
                background: '#ffdad6',
                color: '#ba1a1a',
                padding: '16px',
                borderRadius: '50%',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={32} />
              </div>
              <h2 style={{ fontSize: '20px', color: '#002045', fontWeight: 700, marginBottom: '8px' }}>
                Access Restricted (RBAC Policy)
              </h2>
              <p style={{ maxWidth: '420px', color: '#43474e', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                Your current role (<strong>{currentRole.label}</strong>) does not have clearance to view this module. Please switch roles in the top bar or return to your permitted command dashboard.
              </p>
              <button
                onClick={() => setActiveTab('map')}
                className="btn-primary"
              >
                <ArrowLeft size={15} /> Return to GIS Command Map
              </button>
            </div>
          )}

          {/* 4. Relocated & Restyled Right Alert Feed */}
          <AlertFeed onWsStatusChange={setWsConnected} />
        </main>
      </div>

      {/* 5. Fixed Bottom Footer Status Bar (~28px) */}
      <Footer cameraCount={5} wsConnected={wsConnected} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
