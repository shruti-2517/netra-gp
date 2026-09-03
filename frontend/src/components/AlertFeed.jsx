import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronRight, ChevronLeft, Trash2, ShieldAlert, Filter, AlertTriangle, Zap } from 'lucide-react';

export default function AlertFeed({ onWsStatusChange }) {
  const [alerts, setAlerts] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' or 'HIGH_ONLY'
  const [newAlertToast, setNewAlertToast] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // 1. Fetch latest alerts from REST API
  const fetchAlerts = () => {
    fetch('http://localhost:8000/api/v1/alerts')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const cleanAlerts = data.filter(a => !a.camera_id || !a.camera_id.startsWith('CAM-BATCH-'));
          setAlerts(cleanAlerts);
        }
      })
      .catch(() => {});
  };

  // 2. Setup WebSocket with Auto-Reconnect & Periodic Sync
  useEffect(() => {
    fetchAlerts();

    // Periodic Background Sync (every 2 seconds fallback guarantee)
    const pollInterval = setInterval(fetchAlerts, 2000);

    const connectWS = () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/api/v1/ws/alerts');
        wsRef.current = ws;

        ws.onopen = () => {
          if (onWsStatusChange) onWsStatusChange(true);
        };

        ws.onclose = () => {
          if (onWsStatusChange) onWsStatusChange(false);
          // Auto reconnect after 2.5s
          reconnectTimeoutRef.current = setTimeout(connectWS, 2500);
        };

        ws.onerror = () => {
          if (onWsStatusChange) onWsStatusChange(false);
          ws.close();
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.license_plate) {
              setAlerts(prev => [payload, ...prev]);
              // Trigger Live Toast notification
              setNewAlertToast(payload);
              setTimeout(() => setNewAlertToast(null), 4000);
            }
          } catch (err) {}
        };
      } catch (err) {
        if (onWsStatusChange) onWsStatusChange(false);
        reconnectTimeoutRef.current = setTimeout(connectWS, 2500);
      }
    };

    connectWS();

    return () => {
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleClearAlerts = () => {
    setAlerts([]);
    fetch('http://localhost:8000/api/v1/alerts', { method: 'DELETE' }).catch(() => {});
  };

  // Client-side filtering
  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'HIGH_ONLY') {
      return a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH';
    }
    return true;
  });

  return (
    <div style={{
      width: isCollapsed ? '48px' : '340px',
      background: '#ffffff',
      borderLeft: '1px solid #c4c6cf',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 800,
      position: 'relative',
      flexShrink: 0
    }}>
      {/* Real-Time Toast Alert */}
      {newAlertToast && !isCollapsed && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          right: '10px',
          background: '#ba1a1a',
          color: '#ffffff',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(186, 26, 26, 0.35)',
          animation: 'pulse 1s infinite alternate',
          fontSize: '11px',
          fontFamily: 'var(--font-headline)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>🚨 INCOMING LIVE TARGET ALERT!</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>JUST NOW</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {newAlertToast.license_plate}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.9 }}>
            {newAlertToast.reason} ({newAlertToast.camera_id})
          </div>
        </div>
      )}

      {/* Alert Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #e0e3e5',
        background: '#f2f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: '#ffdad6',
              color: '#ba1a1a',
              padding: '5px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={15} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#002045', margin: 0 }}>
                Live Alert Feed
              </h3>
              <p style={{ fontSize: '10px', color: '#43474e', margin: 0, fontFamily: 'var(--font-mono)' }}>
                {filteredAlerts.length} Watchlist Hits
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isCollapsed && alerts.length > 0 && (
            <button 
              onClick={handleClearAlerts}
              title="Clear All Alerts"
              style={{
                background: '#ffdad6',
                border: '1px solid #ffb4ab',
                color: '#93000a',
                padding: '3px 7px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Trash2 size={11} /> Clear
            </button>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Alert Feed" : "Collapse Alert Feed"}
            style={{
              background: '#ffffff',
              border: '1px solid #c4c6cf',
              color: '#191c1e',
              padding: '4px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {!isCollapsed && (
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 12px',
          background: '#eceef0',
          borderBottom: '1px solid #e0e3e5'
        }}>
          <button
            onClick={() => setFilterSeverity('ALL')}
            style={{
              flex: 1,
              padding: '4px 8px',
              borderRadius: '4px',
              border: filterSeverity === 'ALL' ? '1px solid #1a365d' : '1px solid #c4c6cf',
              background: filterSeverity === 'ALL' ? '#1a365d' : '#ffffff',
              color: filterSeverity === 'ALL' ? '#ffffff' : '#43474e',
              fontSize: '11px',
              fontFamily: 'var(--font-headline)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH_ONLY')}
            style={{
              flex: 1,
              padding: '4px 8px',
              borderRadius: '4px',
              border: filterSeverity === 'HIGH_ONLY' ? '1px solid #ba1a1a' : '1px solid #c4c6cf',
              background: filterSeverity === 'HIGH_ONLY' ? '#ffdad6' : '#ffffff',
              color: filterSeverity === 'HIGH_ONLY' ? '#93000a' : '#43474e',
              fontSize: '11px',
              fontFamily: 'var(--font-headline)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            High / Critical Only
          </button>
        </div>
      )}

      {/* Alert Feed Body */}
      {!isCollapsed && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: '#f7f9fb'
        }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ color: '#74777f', fontSize: '12px', textAlign: 'center', padding: '30px 10px' }}>
              No active alerts matching filter.
            </div>
          ) : (
            filteredAlerts.map(a => (
              <div 
                key={a.alert_id || a.id || Math.random()}
                style={{
                  background: '#ffffff',
                  border: `1px solid ${a.threat_level === 'CRITICAL' ? '#ba1a1a' : a.threat_level === 'WARNING' ? '#fe932c' : '#f97316'}`,
                  borderRadius: '4px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* 1. Badge & Timestamp */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={
                    a.threat_level === 'CRITICAL' ? 'badge-threat-critical' : a.threat_level === 'WARNING' ? 'badge-threat-medium' : 'badge-threat-high'
                  } style={{ fontSize: '10px' }}>
                    🚨 {a.threat_level || 'ALERT'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#74777f', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {a.timestamp ? a.timestamp.split('T')[1]?.replace('Z','') : 'NOW'}
                  </span>
                </div>

                {/* 2. Plate Number */}
                <div>
                  <span className="license-plate-badge" style={{ fontSize: '12px' }}>{a.license_plate}</span>
                </div>

                {/* 3. Reason / FIR Ref */}
                <div style={{ fontSize: '12px', color: '#191c1e', fontWeight: 600 }}>
                  {a.reason}
                </div>

                {/* 4. Camera & City */}
                <div style={{ fontSize: '11px', color: '#43474e', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eceef0', paddingTop: '5px' }}>
                  <span>Camera: <strong style={{ color: '#1a365d' }}>{a.camera_id}</strong></span>
                  <span>City: <strong style={{ color: '#191c1e' }}>{a.city || 'Gujarat'}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
