import React from 'react';

export default function AlertFeed() {
  const sampleAlerts = [
    {
      id: 'ALT-1001',
      plate: 'GJ01AB1234',
      type: 'STOLEN VEHICLE MATCH',
      camera: 'SG Highway - Iscon Crossroad (Ahmedabad)',
      timestamp: '21:24:05',
      severity: 'CRITICAL',
      vehicle: 'White Hyundai Creta'
    },
    {
      id: 'ALT-1002',
      plate: 'GJ18CD5678',
      type: 'CRIMINAL WANTED MATCH',
      camera: 'GH-5 Circle (Gandhinagar)',
      timestamp: '21:18:12',
      severity: 'HIGH',
      vehicle: 'Black Mahindra Scorpio'
    }
  ];

  return (
    <aside style={{
      width: '360px',
      background: '#0f1626',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🚨 Real-Time Alert Feed
        </h2>
        <span style={{
          background: 'rgba(255, 59, 48, 0.2)',
          color: '#ff3b30',
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          {sampleAlerts.length} LIVE
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sampleAlerts.map(alert => (
          <div key={alert.id} style={{
            background: alert.severity === 'CRITICAL' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 204, 0, 0.1)',
            border: alert.severity === 'CRITICAL' ? '1px solid rgba(255, 59, 48, 0.4)' : '1px solid rgba(255, 204, 0, 0.4)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="license-plate-badge">{alert.plate}</span>
              <span style={{ fontSize: '11px', color: alert.severity === 'CRITICAL' ? '#ff3b30' : '#ffcc00', fontWeight: '700' }}>
                {alert.severity}
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{alert.type}</div>
            <div style={{ fontSize: '12px', color: '#8a99ad' }}>🚗 {alert.vehicle}</div>
            <div style={{ fontSize: '11px', color: '#5c6b7e', display: 'flex', justifyContent: 'space-between' }}>
              <span>📍 {alert.camera}</span>
              <span>⏱️ {alert.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
