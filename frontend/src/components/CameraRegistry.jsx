import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Filter, Database, Camera } from 'lucide-react';

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
    <div style={{ flex: 1, padding: '24px', background: '#f7f9fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="#1a365d" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#002045', margin: 0 }}>
              Statewide Camera Metadata Registry
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: '#43474e', margin: '4px 0 0 0' }}>
            Model 1: Centralized Inventory & Spatial Metadata for ~80,000 Heterogeneous CCTV Feeds across 26 Departments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href="http://localhost:8000/api/v1/reports/export-csv"
            download
            className="btn-secondary"
          >
            <Download size={14} /> Export CSV Report
          </a>

          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus size={15} /> Register Camera Node
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{
        background: '#ffffff',
        padding: '14px 18px',
        borderRadius: '8px',
        border: '1px solid #c4c6cf',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0, 32, 69, 0.05)'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f2f4f6',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #c4c6cf'
        }}>
          <Search size={16} color="#74777f" />
          <input 
            type="text" 
            placeholder="Search by Camera ID, Location Name, or City..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#191c1e', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#74777f" />
          <select 
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="input-field"
            style={{ fontWeight: 600 }}
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
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #c4c6cf',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0, 32, 69, 0.06)'
      }}>
        <table className="data-table-container">
          <thead>
            <tr>
              <th>Camera ID</th>
              <th>Location Name</th>
              <th>Department Owner</th>
              <th>City / Sector</th>
              <th>Coordinates (Lat / Lng)</th>
              <th>Protocol / Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCameras.map(c => (
              <tr key={c.camera_id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1a365d' }}>{c.camera_id}</td>
                <td style={{ fontWeight: 600, color: '#002045' }}>{c.name}</td>
                <td style={{ color: '#43474e' }}>{c.department}</td>
                <td style={{ fontWeight: 600 }}>{c.city}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#74777f' }}>
                  {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                </td>
                <td>
                  <span style={{
                    background: '#f2f4f6',
                    color: '#1a365d',
                    border: '1px solid #c4c6cf',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600
                  }}>
                    {c.type}
                  </span>
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#dcfce7',
                    color: '#14532d',
                    border: '1px solid #86efac',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    ● {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding camera */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 32, 69, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            border: '2px solid #1a365d',
            borderRadius: '8px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 32, 69, 0.25)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#002045', marginBottom: '16px' }}>
              Register New Camera Node
            </h3>

            <form onSubmit={handleAddCamera} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>CAMERA ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. CAM-AHM-006" 
                  value={newCam.camera_id} 
                  onChange={e => setNewCam({ ...newCam, camera_id: e.target.value })} 
                  className="input-field"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>LOCATION / CROSSROAD NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. C.G. Road - Panchvati Circle" 
                  value={newCam.name} 
                  onChange={e => setNewCam({ ...newCam, name: e.target.value })} 
                  className="input-field"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>CITY</label>
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
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>DEPARTMENT</label>
                  <input 
                    type="text" 
                    value={newCam.department} 
                    onChange={e => setNewCam({ ...newCam, department: e.target.value })} 
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Save Camera Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
