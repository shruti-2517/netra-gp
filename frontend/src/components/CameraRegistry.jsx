import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Filter, Database, Camera } from 'lucide-react';
import { API_BASE_URL } from '../config';

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
    fetch(`${API_BASE_URL}/api/v1/cameras`)
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

    fetch(`${API_BASE_URL}/api/v1/cameras`, {
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
            href={`${API_BASE_URL}/api/v1/reports/export-csv`}
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
