import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Shield, Radio, Navigation, Building2, Video, Compass } from 'lucide-react';
import L from 'leaflet';
import { API_BASE_URL } from '../config';

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

// Custom Enterprise Camera Markers
const activeCameraIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: #1a365d;
    border: 2px solid #fe932c;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 32, 69, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
  ">📹</div>`,
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

const CITIES_GEOLOCATION = [
  { name: "Gujarat State", coords: [22.2587, 71.1924], zoom: 7 },
  { name: "Ahmedabad", coords: [23.0225, 72.5714], zoom: 12 },
  { name: "Gandhinagar", coords: [23.2156, 72.6369], zoom: 12 },
  { name: "Surat", coords: [21.1702, 72.8311], zoom: 12 },
  { name: "Vadodara", coords: [22.3072, 73.1812], zoom: 12 },
  { name: "Rajkot", coords: [22.3039, 70.8022], zoom: 12 }
];

export default function GisMap() {
  const [cameras, setCameras] = useState([]);
  const [mapTarget, setMapTarget] = useState({ center: [22.2587, 71.1924], zoom: 7 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/cameras`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setCameras(data);
        } else {
          fetch(`${API_BASE_URL}/api/ingest`)
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setCameras(d); })
            .catch(() => {});
        }
      })
      .catch(() => {
        fetch(`${API_BASE_URL}/api/ingest`)
          .then(r => r.json())
          .then(d => { if (Array.isArray(d)) setCameras(d); })
          .catch(() => {});
      });
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', background: '#eceef0' }}>
      {/* Floating Tactical Dossier Card */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 999,
        background: '#ffffff',
        padding: '18px',
        borderRadius: '8px',
        border: '1px solid #c4c6cf',
        maxWidth: '340px',
        boxShadow: '0 4px 12px rgba(0, 32, 69, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="#1a365d" />
            <h3 style={{ fontSize: '15px', color: '#002045', fontWeight: 700, margin: 0 }}>GIS Command Map</h3>
          </div>
          <span style={{
            fontSize: '10px',
            background: 'rgba(26, 54, 93, 0.1)',
            color: '#1a365d',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #86a0cd',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700
          }}>
            MODEL 1
          </span>
        </div>
        
        <p style={{ fontSize: '12px', color: '#43474e', lineHeight: '1.45', marginBottom: '14px' }}>
          Centralized spatial database mapping <strong>~80,000 CCTV cameras</strong> across 26 Gujarat government departmental networks.
        </p>

        {/* Quick City Zoom Selector */}
        <div style={{ fontSize: '11px', color: '#74777f', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.04em' }}>
          QUICK CITY FOCUS:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {CITIES_GEOLOCATION.map(c => (
            <button
              key={c.name}
              onClick={() => setMapTarget({ center: c.coords, zoom: c.zoom })}
              style={{
                background: '#f2f4f6',
                border: '1px solid #c4c6cf',
                color: '#191c1e',
                padding: '4px 9px',
                borderRadius: '4px',
                fontFamily: 'var(--font-headline)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={e => {
                e.target.style.background = '#1a365d';
                e.target.style.color = '#ffffff';
                e.target.style.borderColor = '#1a365d';
              }}
              onMouseOut={e => {
                e.target.style.background = '#f2f4f6';
                e.target.style.color = '#191c1e';
                e.target.style.borderColor = '#c4c6cf';
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#43474e', paddingTop: '10px', borderTop: '1px solid #e0e3e5' }}>
          <span>Active Feeds: <strong style={{ color: '#15803d' }}>{cameras.length} Verified</strong></span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>EPSG:4326</span>
        </div>
      </div>

      {/* Leaflet Map Container with Clean Unwatermarked OpenStreetMap Tiles */}
      <MapContainer 
        center={mapTarget.center} 
        zoom={mapTarget.zoom} 
        style={{ height: '100%', width: '100%', background: '#eceef0' }}
        zoomControl={false}
      >
        <MapFlyTo center={mapTarget.center} zoom={mapTarget.zoom} />
        
        {/* OpenStreetMap Standard Tiles (Zero Watermark / No API Key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Camera Markers */}
        {cameras.map((cam, idx) => {
          const lat = parseFloat(cam.latitude) || 23.0225;
          const lng = parseFloat(cam.longitude) || 72.5714;
          const cid = cam.camera_id || cam.id || `CAM-${idx}`;
          return (
            <Marker 
              key={cid} 
              position={[lat, lng]}
              icon={activeCameraIcon}
            >
            <Popup>
              <div style={{ padding: '4px 2px', minWidth: '190px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1a365d', fontFamily: 'var(--font-mono)' }}>{cam.camera_id}</span>
                  <span style={{
                    fontSize: '10px',
                    background: cam.status === 'ACTIVE' ? '#dcfce7' : '#ffdad6',
                    color: cam.status === 'ACTIVE' ? '#14532d' : '#93000a',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    border: `1px solid ${cam.status === 'ACTIVE' ? '#86efac' : '#fca5a5'}`
                  }}>
                    {cam.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#002045', marginBottom: '4px' }}>{cam.name}</h4>
                <div style={{ fontSize: '12px', color: '#43474e', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div>City: <strong style={{ color: '#191c1e' }}>{cam.city}</strong></div>
                  <div>Department: <strong style={{ color: '#191c1e' }}>{cam.department}</strong></div>
                  <div>Type: <strong style={{ color: '#191c1e' }}>{cam.type}</strong></div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
      </MapContainer>
    </div>
  );
}
