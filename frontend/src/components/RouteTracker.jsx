import React, { useState, useEffect } from 'react';
import { Search, Route, Navigation, Compass, AlertCircle, Radio, ShieldAlert, Crosshair, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { API_BASE_URL } from '../config';

const waypointsIcon = L.divIcon({
  className: 'route-waypoint-marker',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: #1a365d;
    color: #ffffff;
    font-weight: 700;
    font-size: 11px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 32, 69, 0.4);
  ">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const predictedIcon = L.divIcon({
  className: 'predicted-waypoint-marker',
  html: `<div style="
    width: 32px;
    height: 32px;
    background: #fe932c;
    color: #002045;
    font-weight: 800;
    font-size: 14px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 14px #fe932c;
  ">🎯</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const EMPTY_ROUTE_DATA = {
  license_plate: "",
  total_detections: 0,
  waypoints: []
};

export default function RouteTracker() {
  const [searchPlate, setSearchPlate] = useState('GJ01AB1234');
  const [routeData, setRouteData] = useState(EMPTY_ROUTE_DATA);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRouteAndPrediction = (plate) => {
    if (!plate) return;
    setLoading(true);
    
    // 1. Fetch historical route waypoints
    fetch(`${API_BASE_URL}/api/v1/tracking/${plate}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.waypoints) {
          setRouteData(data);
        } else {
          setRouteData({ license_plate: plate, total_detections: 0, waypoints: [] });
        }
      })
      .catch(() => setRouteData({ license_plate: plate, total_detections: 0, waypoints: [] }));

    // 2. Fetch predictive interception forecast
    fetch(`${API_BASE_URL}/api/v1/tracking/${plate}/predict`)
      .then(res => res.json())
      .then(pred => {
        if (pred && pred.predicted_checkpoints) {
          setPrediction(pred);
        } else {
          setPrediction(null);
        }
      })
      .catch(() => {
        setPrediction(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRouteAndPrediction(searchPlate);
  }, []);

  const waypoints = routeData?.waypoints || [];
  const polylineCoords = waypoints.map(w => [w.latitude, w.longitude]);
  const lastWaypoint = waypoints.length > 0 ? waypoints[waypoints.length - 1] : null;

  // Predictive vector connecting last known waypoint to top predicted checkpoints
  const predictedCoords = (prediction && prediction.predicted_checkpoints && lastWaypoint)
    ? prediction.predicted_checkpoints.map(p => [
        [lastWaypoint.latitude, lastWaypoint.longitude],
        [p.latitude, p.longitude]
      ])
    : [];

  const mapCenter = polylineCoords.length > 0 ? polylineCoords[0] : [23.0298, 72.5074];

  return (
    <div style={{ flex: 1, padding: '20px', background: '#f7f9fb', overflow: 'hidden', display: 'flex', gap: '18px' }}>
      {/* Left Sidebar: Dossier Timeline & Predictive Interception */}
      <div style={{
        width: '390px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: '16px',
        overflowY: 'auto',
        background: '#ffffff',
        border: '1px solid #c4c6cf',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 32, 69, 0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1a365d', marginBottom: '3px' }}>
            <Navigation size={16} color="#1a365d" />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'var(--font-headline)' }}>
              SPATIAL TELEMETRY & ESCAPE FORECAST
            </span>
          </div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#002045' }}>Vehicle Route & Interception Tracer</h2>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Enter Plate (e.g. GJ01AB1234)"
            value={searchPlate}
            onChange={e => setSearchPlate(e.target.value.toUpperCase())}
            className="input-field"
            style={{ flex: 1, fontFamily: 'var(--font-mono)', fontWeight: 600 }}
          />
          <button 
            onClick={() => fetchRouteAndPrediction(searchPlate)}
            className="btn-primary"
            style={{ padding: '8px 14px' }}
          >
            <Search size={15} /> Analyze
          </button>
        </div>

        {/* Target Dossier Header Card */}
        <div style={{
          background: '#f2f4f6',
          padding: '12px 14px',
          borderRadius: '6px',
          border: '1px solid #c4c6cf'
        }}>
          <span style={{ fontSize: '10px', color: '#74777f', display: 'block', marginBottom: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>
            TARGET VEHICLE DOSSIER
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="license-plate-badge" style={{ fontSize: '14px' }}>{routeData.license_plate}</span>
            <span style={{
              fontSize: '11px',
              background: '#dcfce7',
              color: '#14532d',
              border: '1px solid #86efac',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              {routeData.total_detections} Checkpoints
            </span>
          </div>
        </div>

        {/* Predictive Interception Alert Card */}
        {prediction && prediction.predicted_checkpoints && prediction.predicted_checkpoints.length > 0 && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '14px',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#904d00', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              <Radio size={16} color="#d97706" /> PREDICTED ESCAPE INTERCEPT
            </div>
            
            {prediction.predicted_checkpoints.map((p, idx) => (
              <div key={idx} style={{ fontSize: '12px', color: '#191c1e', paddingTop: idx > 0 ? '8px' : '0', borderTop: idx > 0 ? '1px solid #fef3c7' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#002045' }}>{p.camera_name}</strong>
                  <span style={{ color: '#904d00', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {Math.round(p.probability_score * 100)}% Prob.
                  </span>
                </div>
                <div style={{ color: '#43474e', fontSize: '11px', marginTop: '2px' }}>
                  {p.city} • {p.distance_km} km away • ETA: ~{p.eta_minutes} mins
                </div>
                <div style={{
                  marginTop: '6px',
                  display: 'inline-block',
                  background: '#fe932c',
                  color: '#002045',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em'
                }}>
                  🚨 {p.recommended_action}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sequential Timeline List with Speeds */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
          <div style={{ fontSize: '11px', color: '#74777f', fontWeight: 700, letterSpacing: '0.04em' }}>
            HISTORICAL TRANSIT TIMELINE:
          </div>
          {routeData.waypoints.map((w) => (
            <div 
              key={w.sequence}
              style={{
                position: 'relative',
                background: '#ffffff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e0e3e5',
                display: 'flex',
                gap: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{
                background: '#1a365d',
                color: '#ffffff',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '11px',
                flexShrink: 0
              }}>
                {w.sequence}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1a365d', fontFamily: 'var(--font-mono)' }}>{w.camera_id}</span>
                  <span style={{ fontSize: '10px', color: '#74777f', fontFamily: 'var(--font-mono)' }}>{w.timestamp.replace('T', ' ').replace('Z', '')}</span>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#191c1e', margin: '3px 0 2px 0' }}>{w.camera_name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <p style={{ fontSize: '12px', color: '#43474e', margin: 0 }}>City: <strong style={{ color: '#191c1e' }}>{w.city}</strong></p>
                  {w.speed_kmh && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: w.speed_kmh > 80 ? '#ffdad6' : '#dcfce7',
                      color: w.speed_kmh > 80 ? '#93000a' : '#14532d',
                      border: `1px solid ${w.speed_kmh > 80 ? '#ba1a1a' : '#15803d'}`
                    }}>
                      ⚡ {w.speed_kmh} km/h
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Map Canvas with Clean OpenStreetMap Tiles */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '8px',
        border: '1px solid #c4c6cf',
        background: '#eceef0',
        boxShadow: '0 2px 6px rgba(0, 32, 69, 0.08)'
      }}>
        <MapContainer 
          center={mapCenter} 
          zoom={8} 
          style={{ height: '100%', width: '100%', background: '#eceef0' }}
        >
          {/* OpenStreetMap Standard Clean Tiles (No API key watermark) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Historical Trajectory Polyline */}
          {polylineCoords.length > 1 && (
            <Polyline 
              positions={polylineCoords} 
              pathOptions={{ color: '#1a365d', weight: 4, opacity: 0.95 }} 
            />
          )}

          {/* Predictive Interception Vectors */}
          {predictedCoords.map((segment, idx) => (
            <Polyline
              key={idx}
              positions={segment}
              pathOptions={{ color: '#d97706', weight: 3.5, dashArray: '8, 8', opacity: 0.9 }}
            />
          ))}

          {/* Historical Waypoint Markers */}
          {routeData.waypoints.map(w => (
            <Marker 
              key={w.sequence} 
              position={[w.latitude, w.longitude]}
              icon={waypointsIcon}
            >
              <Popup>
                <div style={{ padding: '4px 2px' }}>
                  <span style={{ fontSize: '11px', color: '#1a365d', fontWeight: 700 }}>CHECKPOINT #{w.sequence}</span>
                  <h4 style={{ fontSize: '13px', color: '#002045', margin: '2px 0' }}>{w.camera_name}</h4>
                  <p style={{ fontSize: '11px', color: '#43474e' }}>Time: {w.timestamp}</p>
                  {w.speed_kmh && (
                    <p style={{ fontSize: '11px', color: '#ba1a1a', fontWeight: 700 }}>
                      Speed: {w.speed_kmh} km/h {w.speed_kmh > 80 ? '(OVERSPEEDING)' : ''}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Predictive Checkpoint Markers */}
          {prediction && prediction.predicted_checkpoints && prediction.predicted_checkpoints.map((p, idx) => (
            <React.Fragment key={idx}>
              <Circle
                center={[p.latitude, p.longitude]}
                radius={8000}
                pathOptions={{ color: '#fe932c', fillColor: '#fe932c', fillOpacity: 0.2 }}
              />
              <Marker
                position={[p.latitude, p.longitude]}
                icon={predictedIcon}
              >
                <Popup>
                  <div style={{ padding: '4px 2px' }}>
                    <span style={{ fontSize: '11px', color: '#904d00', fontWeight: 800 }}>🎯 PREDICTED INTERCEPTION ZONE</span>
                    <h4 style={{ fontSize: '13px', color: '#002045', margin: '2px 0' }}>{p.camera_name}</h4>
                    <p style={{ fontSize: '11px', color: '#43474e' }}>Probability: <strong>{Math.round(p.probability_score * 100)}%</strong></p>
                    <p style={{ fontSize: '11px', color: '#43474e' }}>Est. ETA: ~{p.eta_minutes} mins</p>
                    <div style={{ color: '#904d00', fontWeight: 700, fontSize: '11px' }}>Action: {p.recommended_action}</div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
