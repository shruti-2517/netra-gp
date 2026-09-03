import React, { useState, useEffect } from 'react';
import { Activity, Radio, Database, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer({ cameraCount = 5, wsConnected = true }) {
  const { currentRole } = useAuth();
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/health')
      .then(res => res.json())
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
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
          <span>{cameraCount} FEEDS ACTIVE (H.264/H.265)</span>
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
