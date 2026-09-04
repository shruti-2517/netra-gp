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

const DEFAULT_CAMERAS = [
  { camera_id: "cam01", name: "Ahmedabad - SG Highway Iscon Crossroad", department: "Police / Traffic", city: "Ahmedabad", latitude: 23.0298, longitude: 72.5074, stream_url: "https://cctv.corp8.cloud/cam01/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam02", name: "Ahmedabad - SG Highway Bopal Junction", department: "Police / Traffic", city: "Ahmedabad", latitude: 23.0350, longitude: 72.4822, stream_url: "https://cctv.corp8.cloud/cam02/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam03", name: "Ahmedabad - C G Road Ellisbridge", department: "Municipal Corporation", city: "Ahmedabad", latitude: 23.0245, longitude: 72.5620, stream_url: "https://cctv.corp8.cloud/cam03/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam04", name: "Ahmedabad - Narol Highway Checkpost", department: "RTO Checkpost", city: "Ahmedabad", latitude: 22.9734, longitude: 72.5932, stream_url: "https://cctv.corp8.cloud/cam04/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam05", name: "Ahmedabad - SP Ring Road Vaishnodevi", department: "Police / Traffic", city: "Ahmedabad", latitude: 23.1360, longitude: 72.5412, stream_url: "https://cctv.corp8.cloud/cam05/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam06", name: "Gandhinagar - GH-5 Circle Central", department: "Home Department", city: "Gandhinagar", latitude: 23.2156, longitude: 72.6369, stream_url: "https://cctv.corp8.cloud/cam06/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam07", name: "Gandhinagar - CH-0 Circle Secretariat", department: "Home Department", city: "Gandhinagar", latitude: 23.2234, longitude: 72.6512, stream_url: "https://cctv.corp8.cloud/cam07/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam08", name: "Gandhinagar - Infocity IT Park Gate", department: "Smart City VMS", city: "Gandhinagar", latitude: 23.1890, longitude: 72.6280, stream_url: "https://cctv.corp8.cloud/cam08/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam09", name: "Gandhinagar - Koba Circle Toll Gate", department: "RTO Checkpost", city: "Gandhinagar", latitude: 23.1412, longitude: 72.6210, stream_url: "https://cctv.corp8.cloud/cam09/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam10", name: "Gandhinagar - GIFT City Expressway", department: "Smart City VMS", city: "Gandhinagar", latitude: 23.1601, longitude: 72.6840, stream_url: "https://cctv.corp8.cloud/cam10/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam11", name: "Surat - Ring Road Textile Market", department: "Smart City VMS", city: "Surat", latitude: 21.1959, longitude: 72.8302, stream_url: "https://cctv.corp8.cloud/cam11/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam12", name: "Surat - Adajan Hazira Highway Junction", department: "Police / Traffic", city: "Surat", latitude: 21.1980, longitude: 72.7950, stream_url: "https://cctv.corp8.cloud/cam12/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam13", name: "Surat - Varachha Diamond Market", department: "Municipal Corporation", city: "Surat", latitude: 21.2140, longitude: 72.8590, stream_url: "https://cctv.corp8.cloud/cam13/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam14", name: "Surat - Udhna Magdalla Highway", department: "RTO Checkpost", city: "Surat", latitude: 21.1520, longitude: 72.8120, stream_url: "https://cctv.corp8.cloud/cam14/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam15", name: "Surat - Kamrej Toll Plaza Entrance", department: "Police / Traffic", city: "Surat", latitude: 21.2670, longitude: 72.9610, stream_url: "https://cctv.corp8.cloud/cam15/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam16", name: "Vadodara - Alkapuri Underpass", department: "Home Department", city: "Vadodara", latitude: 22.3072, longitude: 73.1812, stream_url: "https://cctv.corp8.cloud/cam16/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam17", name: "Vadodara - Golden Circle Highway", department: "Police / Traffic", city: "Vadodara", latitude: 22.3380, longitude: 73.2040, stream_url: "https://cctv.corp8.cloud/cam17/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam18", name: "Vadodara - Sayajigunj Railway Station Circle", department: "Municipal Corporation", city: "Vadodara", latitude: 22.3100, longitude: 73.1890, stream_url: "https://cctv.corp8.cloud/cam18/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam19", name: "Vadodara - Makarpura Industrial Corridor", department: "Smart City VMS", city: "Vadodara", latitude: 22.2420, longitude: 73.1950, stream_url: "https://cctv.corp8.cloud/cam19/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam20", name: "Vadodara - Express Highway Checkpost", department: "RTO Checkpost", city: "Vadodara", latitude: 22.3610, longitude: 73.2280, stream_url: "https://cctv.corp8.cloud/cam20/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam21", name: "Rajkot - Kalawad Road Junction", department: "RTO Checkpost", city: "Rajkot", latitude: 22.2916, longitude: 70.7932, stream_url: "https://cctv.corp8.cloud/cam21/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam22", name: "Rajkot - 150 Feet Ring Road Circle", department: "Police / Traffic", city: "Rajkot", latitude: 22.2850, longitude: 70.7680, stream_url: "https://cctv.corp8.cloud/cam22/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam23", name: "Rajkot - Yagnik Road Market Axis", department: "Municipal Corporation", city: "Rajkot", latitude: 22.2990, longitude: 70.7980, stream_url: "https://cctv.corp8.cloud/cam23/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam24", name: "Rajkot - Metoda GIDC Industrial Highway", department: "Smart City VMS", city: "Rajkot", latitude: 22.2410, longitude: 70.6980, stream_url: "https://cctv.corp8.cloud/cam24/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam25", name: "Rajkot - Gondal Highway Checkpost", department: "Home Department", city: "Rajkot", latitude: 22.2210, longitude: 70.8050, stream_url: "https://cctv.corp8.cloud/cam25/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam26", name: "Bhavnagar - Waghawadi Road Circle", department: "Police / Traffic", city: "Bhavnagar", latitude: 21.7645, longitude: 72.1519, stream_url: "https://cctv.corp8.cloud/cam26/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam27", name: "Bhavnagar - Port Highway Junction", department: "RTO Checkpost", city: "Bhavnagar", latitude: 21.7820, longitude: 72.1890, stream_url: "https://cctv.corp8.cloud/cam27/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam28", name: "Jamnagar - Victoria Bridge Highway", department: "Municipal Corporation", city: "Jamnagar", latitude: 22.4707, longitude: 70.0577, stream_url: "https://cctv.corp8.cloud/cam28/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam29", name: "Junagadh - Girnar Darwaza Highway", department: "Police / Traffic", city: "Junagadh", latitude: 21.5222, longitude: 70.4579, stream_url: "https://cctv.corp8.cloud/cam29/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" },
  { camera_id: "cam30", name: "Anand - Amul Dairy Expressway Junction", department: "Smart City VMS", city: "Anand", latitude: 22.5645, longitude: 72.9289, stream_url: "https://cctv.corp8.cloud/cam30/index.m3u8", type: "Sentinel Live Camera", status: "ACTIVE" }
];

const CITIES_GEOLOCATION = [
  { name: "Gujarat State", coords: [22.2587, 71.1924], zoom: 7 },
  { name: "Ahmedabad", coords: [23.0225, 72.5714], zoom: 12 },
  { name: "Gandhinagar", coords: [23.2156, 72.6369], zoom: 12 },
  { name: "Surat", coords: [21.1702, 72.8311], zoom: 12 },
  { name: "Vadodara", coords: [22.3072, 73.1812], zoom: 12 },
  { name: "Rajkot", coords: [22.3039, 70.8022], zoom: 12 }
];

export default function GisMap() {
  const [cameras, setCameras] = useState(DEFAULT_CAMERAS);
  const [mapTarget, setMapTarget] = useState({ center: [22.2587, 71.1924], zoom: 7 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/cameras`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setCameras(data);
      })
      .catch(() => {});
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
        {cameras.map(cam => (
          <Marker 
            key={cam.camera_id} 
            position={[cam.latitude, cam.longitude]}
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
        ))}
      </MapContainer>
    </div>
  );
}
