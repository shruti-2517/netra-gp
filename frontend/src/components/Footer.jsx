import React, { useState, useEffect } from 'react';
import { Activity, Radio, Database, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { API_BASE_URL } from '../config';

export default function Footer({ cameraCount: propCameraCount = 30, wsConnected = true }) {
  const { currentRole } = useAuth();
  const [apiOnline, setApiOnline] = useState(true);
  const [activeCamCount, setActiveCamCount] = useState(propCameraCount);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/health`)
      .then(res => res.json())
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    fetch(`${API_BASE_URL}/api/v1/cameras`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setActiveCamCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer style={{
      height: '28px',
      background: '#002045',
      borderTop: '1px solid #1a365d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      fontSize: '11px',
      fontFamily: 'var(--font-mono)',
      color: '#86a0cd',
      zIndex: 1000,
      flexShrink: 0
    }}>
      {/* Left System State */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Backend API Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: apiOnline ? '#15803d' : '#ba1a1a'
          }}></span>
          <span>API: {apiOnline ? 'ONLINE (:8000)' : 'OFFLINE'}</span>
        </div>

        {/* WebSocket Stream Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: wsConnected ? '#15803d' : '#f59e0b'
          }}></span>
          <span>WS: {wsConnected ? 'LIVE ALERTS SYNCED' : 'RECONNECTING'}</span>
        </div>

        {/* Active Feeds Count (moved from header to footer per section 1 & 2) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffffff' }}>
          <Radio size={11} color="#fe932c" />
          <span>{activeCamCount} FEEDS ACTIVE (H.264/H.265)</span>
        </div>
      </div>

      {/* Right Scope Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#adc7f7' }}>
          JURISDICTION: <strong style={{ color: '#fe932c' }}>{currentRole.department.toUpperCase()}</strong>
        </span>
        <span style={{ color: '#86a0cd' }}>•</span>
        <span style={{ color: '#86a0cd' }}>NETRA-GP v2.0 Enterprise</span>
      </div>
    </footer>
  );
}
