import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Filter } from 'lucide-react';

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

export default function CameraRegistry() {
  const [cameras, setCameras] = useState(DEFAULT_CAMERAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCam, setNewCam] = useState({
    camera_id: '',
    name: '',
    department: 'Police / Traffic',
    city: 'Ahmedabad',
    latitude: 23.0298,
    longitude: 72.5074,
    stream_url: 'data/sample_feeds/traffic1.mp4',
    type: 'IP ANPR Camera'
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/cameras')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setCameras(data);
      })
      .catch(() => {});
  }, []);

  const handleAddCamera = (e) => {
    e.preventDefault();
    const created = { ...newCam, status: 'ACTIVE' };
    setCameras([...cameras, created]);
    setShowAddModal(false);

    fetch('http://localhost:8000/api/v1/cameras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).catch(() => {});
  };

  const filteredCameras = cameras.filter(c => {
    const matchesSearch = c.camera_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'ALL' || c.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div style={{ flex: 1, padding: '20px', background: '#0f172a', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Statewide Camera Metadata Registry</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Model 1: Centralized Inventory & Spatial Metadata for ~80,000 Heterogeneous CCTV Feeds</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href="http://localhost:8000/api/v1/reports/export-csv"
            download
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f1f5f9',
              padding: '8px 14px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={15} /> Export CSV Report
          </a>

          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus size={15} /> Register New Camera
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by Camera ID, Location Name, or City..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} color="#94a3b8" />
          <select 
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="input-field"
          >
            <option value="ALL">All Gujarat Cities</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Surat">Surat</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Rajkot">Rajkot</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table-container">
          <thead>
            <tr>
              <th>Camera ID</th>
              <th>Location / Name</th>
              <th>City</th>
              <th>Department Owner</th>
              <th>Geo Coordinates</th>
              <th>Camera Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCameras.map(cam => (
              <tr key={cam.camera_id}>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>{cam.camera_id}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{cam.name}</td>
                <td>{cam.city}</td>
                <td>
                  <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', color: '#cbd5e1' }}>
                    {cam.department}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' }}>
                  {cam.latitude.toFixed(4)}, {cam.longitude.toFixed(4)}
                </td>
                <td>{cam.type}</td>
                <td>
                  <span className="status-pill status-active" style={{ fontSize: '11px' }}>
                    <span className="status-dot"></span> {cam.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>Register New CCTV Camera Feed</h3>
            <form onSubmit={handleAddCamera} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Camera ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. CAM-AHM-006" 
                  value={newCam.camera_id}
                  onChange={e => setNewCam({ ...newCam, camera_id: e.target.value })}
                  className="input-field" 
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Location Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ashram Road Intersection" 
                  value={newCam.name}
                  onChange={e => setNewCam({ ...newCam, name: e.target.value })}
                  className="input-field" 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>City</label>
                  <select 
                    value={newCam.city}
                    onChange={e => setNewCam({ ...newCam, city: e.target.value })}
                    className="input-field" 
                    style={{ width: '100%' }}
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Rajkot">Rajkot</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Department</label>
                  <select 
                    value={newCam.department}
                    onChange={e => setNewCam({ ...newCam, department: e.target.value })}
                    className="input-field" 
                    style={{ width: '100%' }}
                  >
                    <option value="Police / Traffic">Police / Traffic</option>
                    <option value="Municipal Corporation">Municipal Corporation</option>
                    <option value="Smart City VMS">Smart City VMS</option>
                    <option value="Home Department">Home Department</option>
                    <option value="RTO Checkpost">RTO Checkpost</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Stream Source URL / File Path</label>
                <input 
                  type="text" 
                  required
                  placeholder="data/sample_feeds/traffic1.mp4 or rtsp://..." 
                  value={newCam.stream_url}
                  onChange={e => setNewCam({ ...newCam, stream_url: e.target.value })}
                  className="input-field" 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
