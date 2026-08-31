import React from 'react';

export default function GisMap() {
  return (
    <div style={{ flex: 1, position: 'relative', height: '100%', width: '100%', background: '#0b0f19' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        background: 'rgba(19, 27, 46, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '320px'
      }}>
        <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '8px' }}>Gujarat State GIS Command</h3>
        <p style={{ fontSize: '12px', color: '#8a99ad', lineHeight: '1.4' }}>
          Real-time GIS map displaying registered CCTV cameras across Ahmedabad, Gandhinagar, Surat, Vadodara, and Rajkot.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '11px', color: '#fff' }}>
          <span>🟢 Active: 5</span>
          <span>🔴 Alert Hotspot: 1</span>
          <span>⚪ Offline: 0</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#5c6b7e',
        fontSize: '14px'
      }}>
        [ Interactive Leaflet.js GIS Map Container - Loading Cameras... ]
      </div>
    </div>
  );
}
