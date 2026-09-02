import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, Trash2 } from 'lucide-react';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // 1. Load genuine alerts from Database API (ignoring old CAM-BATCH- logs)
    fetch('http://localhost:8000/api/v1/alerts')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const cleanAlerts = data.filter(a => !a.camera_id || !a.camera_id.startsWith('CAM-BATCH-'));
          setAlerts(cleanAlerts);
        }
      })
      .catch(() => {});

    // 2. Connect to Live WebSocket Real-Time Alert Broadcaster
    let ws;
    try {
      ws = new WebSocket('ws://localhost:8000/api/v1/ws/alerts');
      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.event === 'WATCHLIST_ALERT' && (!payload.camera_id || !payload.camera_id.startsWith('CAM-BATCH-'))) {
          setAlerts(prev => [payload, ...prev]);
        }
      };
    } catch (err) {
      console.warn("WebSocket connection unavailable");
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleClearAlerts = () => {
    setAlerts([]);
    fetch('http://localhost:8000/api/v1/alerts', { method: 'DELETE' }).catch(() => {});
  };

  return (
    <div style={{
      width: isCollapsed ? '48px' : '340px',
      background: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(16px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000,
      position: 'relative'
    }}>
      {/* Drawer Toggle Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '6px', borderRadius: '6px' }}>
              <Bell size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Real-Time Alert Feed</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Live ANPR Watchlist Hits ({alerts.length})</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isCollapsed && alerts.length > 0 && (
            <button 
              onClick={handleClearAlerts}
              title="Clear All Alerts"
              style={{ background: 'rgba(244,63,94,0.12)', border: 'none', color: '#f43f5e', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={12} /> Clear
            </button>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
          >
            {isCollapsed ? <Bell size={16} color="#f43f5e" /> : <ChevronRight size={15} />}
          </button>
        </div>
      </div>

      {/* Alert Feed Body */}
      {!isCollapsed && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
              No active watchlist alerts. System monitoring live streams...
            </div>
          ) : (
            alerts.map(a => (
              <div 
                key={a.alert_id || a.id}
                style={{
                  background: a.threat_level === 'CRITICAL' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(251, 146, 60, 0.10)',
                  border: a.threat_level === 'CRITICAL' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(251, 146, 60, 0.25)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={
                    a.threat_level === 'CRITICAL' ? 'badge-threat-critical' : 'badge-threat-high'
                  }>
                    🚨 {a.threat_level} ALERT
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {a.timestamp ? a.timestamp.split('T')[1]?.replace('Z','') : 'NOW'}
                  </span>
                </div>

                <div>
                  <span className="license-plate-badge" style={{ fontSize: '13px' }}>{a.license_plate}</span>
                </div>

                <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                  {a.reason}
                </div>

                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4px' }}>
                  <span>Camera: <strong style={{ color: '#38bdf8' }}>{a.camera_id}</strong></span>
                  <span>City: <strong style={{ color: '#fff' }}>{a.city}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
