import React, { useState, useEffect } from 'react';
import { Search, Route, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

const waypointsIcon = L.divIcon({
  className: 'route-waypoint-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: #0284c7;
    color: #fff;
    font-weight: 700;
    font-size: 10px;
    border-radius: 50%;
    border: 2px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  ">📍</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DEFAULT_ROUTE_DATA = {
  license_plate: "GJ01AB1234",
  total_detections: 3,
  waypoints: [
    {
      sequence: 1,
      camera_id: "CAM-AHM-001",
      camera_name: "SG Highway - Iscon Crossroad",
      city: "Ahmedabad",
      latitude: 23.0298,
      longitude: 72.5074,
      timestamp: "2026-09-02T10:15:00Z",
      confidence: 0.92
    },
    {
      sequence: 2,
      camera_id: "CAM-GND-002",
      camera_name: "GH-5 Circle",
      city: "Gandhinagar",
      latitude: 23.2156,
      longitude: 72.6369,
      timestamp: "2026-09-02T11:45:00Z",
      confidence: 0.88
    },
    {
      sequence: 3,
      camera_id: "CAM-BRD-004",
      camera_name: "Alkapuri Underpass",
      city: "Vadodara",
      latitude: 22.3072,
      longitude: 73.1812,
      timestamp: "2026-09-02T14:30:00Z",
      confidence: 0.94
    }
  ]
};

export default function RouteTracker() {
  const [searchPlate, setSearchPlate] = useState('GJ01AB1234');
  const [routeData, setRouteData] = useState(DEFAULT_ROUTE_DATA);
  const [loading, setLoading] = useState(false);

  const fetchRoute = (plate) => {
    if (!plate) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/v1/tracking/${plate}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.waypoints && data.waypoints.length > 0) {
          setRouteData(data);
        } else {
          setRouteData(DEFAULT_ROUTE_DATA);
        }
      })
      .catch(() => setRouteData(DEFAULT_ROUTE_DATA))
      .finally(() => setLoading(false));
  };

  const polylineCoords = routeData.waypoints.map(w => [w.latitude, w.longitude]);
  const mapCenter = polylineCoords.length > 0 ? polylineCoords[0] : [23.0298, 72.5074];

  return (
    <div style={{ flex: 1, padding: '20px', background: '#0f172a', overflow: 'hidden', display: 'flex', gap: '16px' }}>
      {/* Left Sidebar: Timeline Controls */}
      <div className="glass-panel" style={{ width: '360px', display: 'flex', flexDirection: 'column', padding: '18px', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', marginBottom: '2px' }}>
            <Navigation size={16} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>SPATIAL MOVEMENT RECONSTRUCTION</span>
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Vehicle Journey Route Tracer</h2>
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
            onClick={() => fetchRoute(searchPlate)}
            className="btn-primary"
            style={{ padding: '8px 12px' }}
          >
            <Search size={15} /> Trace
          </button>
        </div>

        {/* Target Header Card */}
        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>TARGET VEHICLE:</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="license-plate-badge" style={{ fontSize: '14px' }}>{routeData.license_plate}</span>
            <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              {routeData.total_detections} Waypoints Matched
            </span>
          </div>
        </div>

        {/* Sequential Timeline List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
          {routeData.waypoints.map((w) => (
            <div 
              key={w.sequence}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.02)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                gap: '10px'
              }}
            >
              <div style={{
                background: '#0284c7',
                color: '#fff',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '11px'
              }}>
                {w.sequence}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>{w.camera_id}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{w.timestamp.replace('T', ' ').replace('Z', '')}</span>
                </div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#fff', margin: '3px 0 2px 0' }}>{w.camera_name}</h4>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>City: <strong style={{ color: '#fff' }}>{w.city}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Map Canvas */}
      <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <MapContainer 
          center={mapCenter} 
          zoom={9} 
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Render Subdued Route Polyline */}
          {polylineCoords.length > 1 && (
            <Polyline 
              positions={polylineCoords} 
              pathOptions={{ color: '#38bdf8', weight: 3.5, opacity: 0.85, dashArray: '6, 6' }} 
            />
          )}

          {/* Render Waypoint Markers */}
          {routeData.waypoints.map(w => (
            <Marker 
              key={w.sequence} 
              position={[w.latitude, w.longitude]}
              icon={waypointsIcon}
            >
              <Popup>
                <div style={{ padding: '2px' }}>
                  <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>WAYPOINT #{w.sequence}</span>
                  <h4 style={{ fontSize: '12px', color: '#fff', margin: '2px 0' }}>{w.camera_name}</h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>Time: {w.timestamp}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
