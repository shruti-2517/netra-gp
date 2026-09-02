import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Muted Camera Markers
const activeCameraIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="
    width: 26px;
    height: 26px;
    background: #0284c7;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
  ">📹</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const alertCameraIcon = L.divIcon({
  className: 'custom-leaflet-marker-alert',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: #e11d48;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(225, 29, 72, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
  ">🚨</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Map Controller for Smooth FlyTo Animations
function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const DEFAULT_CAMERAS = [
  {
    camera_id: "CAM-AHM-001",
    name: "SG Highway - Iscon Crossroad",
    department: "Police / Traffic",
    city: "Ahmedabad",
    latitude: 23.0298,
    longitude: 72.5074,
    stream_url: "data/sample_feeds/traffic1.mp4",
    type: "IP ANPR Camera",
    status: "ACTIVE"
  },
  {
    camera_id: "CAM-GND-002",
    name: "GH-5 Circle",
    department: "Municipal Corporation",
    city: "Gandhinagar",
    latitude: 23.2156,
    longitude: 72.6369,
    stream_url: "data/sample_feeds/120678-721759752_medium.mp4",
    type: "Fixed IP Camera",
    status: "ACTIVE"
  },
  {
    camera_id: "CAM-SRT-003",
    name: "Ring Road - Textile Market",
    department: "Smart City VMS",
    city: "Surat",
    latitude: 21.1959,
    longitude: 72.8302,
    stream_url: "data/sample_feeds/153283-804933523_medium.mp4",
    type: "PTZ Camera",
    status: "ACTIVE"
  },
  {
    camera_id: "CAM-BRD-004",
    name: "Alkapuri Underpass",
    department: "Home Department",
    city: "Vadodara",
    latitude: 22.3072,
    longitude: 73.1812,
    stream_url: "data/sample_feeds/154195-807166827_medium.mp4",
    type: "ANPR Camera",
    status: "ACTIVE"
  },
  {
    camera_id: "CAM-RJK-005",
    name: "Kalawad Road",
    department: "RTO Checkpost",
    city: "Rajkot",
    latitude: 22.2916,
    longitude: 70.7932,
    stream_url: "data/sample_feeds/84222-584891447_medium.mp4",
    type: "RTO Speed Cam",
    status: "ACTIVE"
  }
];

const CITIES_GEOLOCATION = [
  { name: 'Statewide View', coords: [22.75, 71.8], zoom: 7.5 },
  { name: 'Ahmedabad', coords: [23.0298, 72.5074], zoom: 12 },
  { name: 'Gandhinagar', coords: [23.2156, 72.6369], zoom: 12 },
  { name: 'Surat', coords: [21.1959, 72.8302], zoom: 12 },
  { name: 'Vadodara', coords: [22.3072, 73.1812], zoom: 12 },
  { name: 'Rajkot', coords: [22.2916, 70.7932], zoom: 12 }
];

export default function GisMap() {
  const [cameras, setCameras] = useState(DEFAULT_CAMERAS);
  const [mapTarget, setMapTarget] = useState({ center: [22.75, 71.8], zoom: 7.5 });

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/cameras')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setCameras(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ flex: 1, position: 'relative', height: '100%', width: '100%' }}>
      {/* Control Overlay Box */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        background: 'rgba(30, 41, 59, 0.90)',
        backdropFilter: 'blur(12px)',
        padding: '16px 20px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '320px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: 700 }}>Gujarat State GIS Command</h3>
          <span style={{ fontSize: '10px', background: '#334155', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600 }}>MODEL 1</span>
        </div>
        
        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '12px' }}>
          Centralized spatial database mapping CCTV cameras across 26 Gujarat departmental networks.
        </p>

        {/* Quick City Zoom Selector */}
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>QUICK CITY FOCUS:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {CITIES_GEOLOCATION.map(c => (
            <button
              key={c.name}
              onClick={() => setMapTarget({ center: c.coords, zoom: c.zoom })}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={e => e.target.style.background = 'rgba(56, 189, 248, 0.2)'}
              onMouseOut={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span>Active Feeds: <strong style={{ color: '#10b981' }}>{cameras.length}</strong></span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer 
        center={mapTarget.center} 
        zoom={mapTarget.zoom} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        zoomControl={false}
      >
        <MapFlyTo center={mapTarget.center} zoom={mapTarget.zoom} />
        
        {/* Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render Camera Markers */}
        {cameras.map(cam => (
          <Marker 
            key={cam.camera_id} 
            position={[cam.latitude, cam.longitude]}
            icon={activeCameraIcon}
          >
            <Popup>
              <div style={{ padding: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>{cam.camera_id}</span>
                  <span style={{ fontSize: '10px', background: cam.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', color: cam.status === 'ACTIVE' ? '#10b981' : '#f43f5e', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {cam.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{cam.name}</h4>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0' }}>City: <strong style={{ color: '#fff' }}>{cam.city}</strong></p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0' }}>Dept: <strong style={{ color: '#fff' }}>{cam.department}</strong></p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0' }}>Type: <strong style={{ color: '#fff' }}>{cam.type}</strong></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
