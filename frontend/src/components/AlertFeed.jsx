import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronRight, ChevronLeft, Trash2, ShieldAlert, AlertTriangle, Zap, Volume2, VolumeX, Radio } from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../config';

export default function AlertFeed({ onWsStatusChange }) {
  const [alerts, setAlerts] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' or 'HIGH_ONLY'
  const [newAlertToast, setNewAlertToast] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Sound chime
  const playAlertSound = () => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  };

  // 1. Fetch latest alerts from REST API
  const fetchAlerts = () => {
    fetch(`${API_BASE_URL}/api/v1/alerts`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setAlerts(data);
        }
      })
      .catch(() => {});
  };

  // 2. Setup WebSocket with Auto-Reconnect & Periodic Sync
  useEffect(() => {
    fetchAlerts();

    // Periodic Background Sync (every 2 seconds)
    const pollInterval = setInterval(fetchAlerts, 2000);

    const connectWS = () => {
      try {
        const ws = new WebSocket(`${WS_BASE_URL}/api/v1/ws/alerts`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (onWsStatusChange) onWsStatusChange(true);
        };

        ws.onclose = () => {
          if (onWsStatusChange) onWsStatusChange(false);
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
              setAlerts(prev => {
                // Avoid instant UI duplicates
                const exists = prev.some(a => a.alert_id === payload.alert_id || (a.license_plate === payload.license_plate && a.camera_id === payload.camera_id && Date.now() - new Date(a.timestamp).getTime() < 10000));
                if (exists) return prev;
                return [payload, ...prev];
              });
              
              setNewAlertToast(payload);
              playAlertSound();
              setTimeout(() => setNewAlertToast(null), 4500);
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
  }, [isSoundEnabled]);

  const handleClearAlerts = () => {
    fetch(`${API_BASE_URL}/api/v1/alerts`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setAlerts([]);
        setNewAlertToast(null);
      })
      .catch(() => {
        setAlerts([]);
      });
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
      width: isCollapsed ? '48px' : '360px',
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
          top: '55px',
          left: '10px',
          right: '10px',
          background: newAlertToast.threat_level === 'CRITICAL' ? '#ba1a1a' : '#904d00',
          color: '#ffffff',
          padding: '12px',
          borderRadius: '6px',
          zIndex: 1000,
          boxShadow: '0 4px 16px rgba(0, 32, 69, 0.35)',
          animation: 'pulse 1s infinite alternate',
          fontSize: '11px',
          fontFamily: 'var(--font-headline)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>🚨 LIVE TARGET INTERCEPTED</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.9 }}>JUST NOW</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
            {newAlertToast.license_plate}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.95 }}>
            {newAlertToast.reason}
          </div>
        </div>
      )}

      {/* Alert Header */}
      <div style={{
        padding: '12px 14px',
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
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#002045', margin: 0 }}>
                Live Alert Feed
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  ● LIVE SYNC
                </span>
                <span style={{ fontSize: '10px', color: '#74777f' }}>•</span>
                <span style={{ fontSize: '10px', color: '#43474e', fontFamily: 'var(--font-mono)' }}>
                  {filteredAlerts.length} Events
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isCollapsed && (
            <>
              <button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                title={isSoundEnabled ? "Mute alert chime" : "Enable alert chime"}
                style={{
                  background: isSoundEnabled ? '#e6e8ea' : '#ffdad6',
                  border: '1px solid #c4c6cf',
                  color: isSoundEnabled ? '#191c1e' : '#ba1a1a',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isSoundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>

              {alerts.length > 0 && (
                <button 
                  onClick={handleClearAlerts}
                  title="Clear All Alerts"
                  style={{
                    background: '#ffdad6',
                    border: '1px solid #ffb4ab',
                    color: '#93000a',
                    padding: '3px 8px',
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
            </>
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
              padding: '5px 8px',
              borderRadius: '4px',
              border: filterSeverity === 'ALL' ? '1px solid #1a365d' : '1px solid #c4c6cf',
              background: filterSeverity === 'ALL' ? '#1a365d' : '#ffffff',
              color: filterSeverity === 'ALL' ? '#ffffff' : '#43474e',
              fontSize: '11px',
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH_ONLY')}
            style={{
              flex: 1,
              padding: '5px 8px',
              borderRadius: '4px',
              border: filterSeverity === 'HIGH_ONLY' ? '1px solid #ba1a1a' : '1px solid #c4c6cf',
              background: filterSeverity === 'HIGH_ONLY' ? '#ffdad6' : '#ffffff',
              color: filterSeverity === 'HIGH_ONLY' ? '#93000a' : '#43474e',
              fontSize: '11px',
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            High / Critical
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
            <div style={{ color: '#74777f', fontSize: '12px', textAlign: 'center', padding: '40px 10px' }}>
              <ShieldAlert size={28} style={{ color: '#c4c6cf', marginBottom: '8px' }} />
              <div>No active alerts matching filter.</div>
              <div style={{ fontSize: '10px', color: '#74777f', marginTop: '4px' }}>Detections from live video and camera feeds will appear here automatically.</div>
            </div>
          ) : (
            filteredAlerts.map(a => {
              const isSpeed = a.event === 'SPEED_VIOLATION_ALERT' || 
                              a.is_speed_violation || 
                              Boolean(a.speed_kmh) || 
                              (a.reason && (
                                a.reason.toLowerCase().includes('overspeeding') || 
                                a.reason.toLowerCase().includes('speed') || 
                                a.reason.toLowerCase().includes('km/h') ||
                                a.reason.toLowerCase().includes('limit')
                              ));
              const isCrit = !isSpeed && a.threat_level === 'CRITICAL';
              const isHigh = !isSpeed && a.threat_level === 'HIGH';

              let badgeText = '📸 ANPR SCAN';
              let badgeBg = '#e2e8f0';
              let badgeColor = '#334155';

              if (isSpeed) {
                badgeText = '⚡ SPEED VIOLATION';
                badgeBg = '#e0f2fe';
                badgeColor = '#0369a1';
              } else if (isCrit) {
                badgeText = '🚨 CRITICAL WATCHLIST';
                badgeBg = '#ffdad6';
                badgeColor = '#ba1a1a';
              } else if (isHigh) {
                badgeText = '⚠️ HIGH WATCHLIST';
                badgeBg = '#ffedd5';
                badgeColor = '#9a3412';
              }

              return (
                <div 
                  key={a.alert_id || a.id || Math.random()}
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${isCrit ? '#ba1a1a' : isHigh ? '#fe932c' : isSpeed ? '#0284c7' : '#c4c6cf'}`,
                    borderLeft: `4px solid ${isCrit ? '#ba1a1a' : isHigh ? '#fe932c' : isSpeed ? '#0284c7' : '#1a365d'}`,
                    borderRadius: '4px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 1px 4px rgba(0, 32, 69, 0.05)'
                  }}
                >
                  {/* 1. Header Strip: Threat Pill + Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 7px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-headline)',
                      background: badgeBg,
                      color: badgeColor
                    }}>
                      {badgeText}
                    </span>
                    <span style={{ fontSize: '10px', color: '#74777f', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {a.timestamp ? (a.timestamp.includes('T') ? a.timestamp.split('T')[1].replace('Z','') : a.timestamp) : 'JUST NOW'}
                    </span>
                  </div>

                  {/* 2. License Plate Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1.5px solid #0f172a',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: '#ffffff'
                    }}>
                      <div style={{
                        background: '#1e3a8a',
                        color: '#ffffff',
                        fontSize: '8px',
                        fontWeight: 900,
                        padding: '3px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span>IND</span>
                      </div>
                      <div style={{
                        padding: '2px 8px',
                        fontSize: '13px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: '#0f172a',
                        letterSpacing: '0.8px'
                      }}>
                        {a.license_plate}
                      </div>
                    </div>

                    {a.speed_kmh && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#ba1a1a',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {a.speed_kmh} km/h
                      </span>
                    )}
                  </div>

                  {/* 3. Reason / Offense */}
                  <div style={{ fontSize: '12px', color: '#191c1e', fontWeight: 600, lineHeight: 1.3 }}>
                    {a.reason}
                  </div>

                  {/* 4. Location Telemetry */}
                  <div style={{
                    fontSize: '10px',
                    color: '#43474e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #eceef0',
                    paddingTop: '6px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <span>Camera: <strong style={{ color: '#1a365d' }}>{a.camera_id}</strong></span>
                    <span>City: <strong style={{ color: '#191c1e' }}>{a.city || 'Ahmedabad'}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
