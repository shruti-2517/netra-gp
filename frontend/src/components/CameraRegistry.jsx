import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Filter, Database, Camera } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function CameraRegistry() {
  const [cameras, setCameras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const [newCam, setNewCam] = useState({
    camera_id: '',
    name: '',
    department: 'Police / Traffic',
    city: 'Ahmedabad',
    latitude: 23.0298,
    longitude: 72.5074,
    stream_url: '',
    type: 'Sentinel Live Camera'
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/cameras`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length >= 30) {
          setCameras(data);
        } else {
          // Fallback to catalogue endpoint if DB has fewer entries
          fetch(`${API_BASE_URL}/api/ingest`, { credentials: 'include' })
            .then(res => res.json())
            .then(ingestData => {
              if (ingestData && Array.isArray(ingestData)) {
                setCameras(ingestData.map(c => ({
                  camera_id: c.camera_id || c.id,
                  name: c.name,
                  department: c.department || "Police / Traffic",
                  city: c.city || "Gujarat",
                  latitude: c.latitude || 23.0,
                  longitude: c.longitude || 72.5,
                  type: c.type || "Sentinel Live Camera",
                  status: (c.live_status || c.status || "ACTIVE").toUpperCase()
                })));
              }
            })
            .catch(() => {});
        }
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
      credentials: 'include',
      body: JSON.stringify(created)
    }).catch(() => {});
  };

  const cities = ['ALL', ...Array.from(new Set(cameras.map(c => c.city).filter(Boolean))).sort()];

  const filteredCameras = cameras.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (c.camera_id || '').toLowerCase().includes(searchLower) || 
                          (c.name || '').toLowerCase().includes(searchLower) ||
                          (c.city || '').toLowerCase().includes(searchLower) ||
                          (c.department || '').toLowerCase().includes(searchLower);
    const matchesCity = selectedCity === 'ALL' || c.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const totalPages = Math.ceil(filteredCameras.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCameras = filteredCameras.slice(startIndex, startIndex + pageSize);

  return (
    <div style={{ flex: 1, padding: '24px', background: '#f7f9fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="#1a365d" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#002045', margin: 0 }}>
              Statewide Camera Metadata Registry ({cameras.length} Active Nodes)
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
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0, 32, 69, 0.05)'
      }}>
        <div style={{
          flex: 1,
          minWidth: '280px',
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
            placeholder="Search by Camera ID, Location Name, City, or Department..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ background: 'transparent', border: 'none', color: '#191c1e', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} color="#74777f" />
            <select 
              value={selectedCity}
              onChange={e => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontWeight: 600 }}
            >
              {cities.map(city => (
                <option key={city} value={city}>
                  {city === 'ALL' ? 'All Gujarat Cities & Sectors' : city}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#43474e', fontWeight: 600 }}>Show:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="input-field"
              style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}
            >
              <option value={10}>10 / Page</option>
              <option value={20}>20 / Page</option>
              <option value={30}>All 30 Nodes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #c4c6cf',
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 250px)',
        boxShadow: '0 2px 6px rgba(0, 32, 69, 0.06)',
        flex: 1
      }}>
        <table className="data-table-container" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#002045' }}>
            <tr>
              <th style={{ background: '#002045', color: '#ffffff', position: 'sticky', top: 0 }}>Camera ID</th>
              <th style={{ background: '#002045', color: '#ffffff', position: 'sticky', top: 0 }}>Location Name</th>
              <th style={{ background: '#002045', color: '#ffffff', position: 'sticky', top: 0 }}>Department Owner</th>
              <th style={{ background: '#002045', color: '#ffffff', position: 'sticky', top: 0 }}>City / Sector</th>
              <th style={{ background: '#002045', color: '#ffffff', position: 'sticky', top: 0 }}>Coordinates (Lat / Lng)</th>
              <th style={{ background: '#002045', color: '#ffffff', position: 'sticky', top: 0 }}>Protocol / Type</th>
              <th style={{ background: '#002045', color: '#ffffff', position: 'sticky', top: 0 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCameras.map(c => (
              <tr key={c.camera_id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1a365d' }}>{c.camera_id}</td>
                <td style={{ fontWeight: 600, color: '#002045' }}>{c.name}</td>
                <td style={{ color: '#43474e' }}>{c.department}</td>
                <td style={{ fontWeight: 600 }}>{c.city}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#74777f' }}>
                  {typeof c.latitude === 'number' ? c.latitude.toFixed(4) : c.latitude}, {typeof c.longitude === 'number' ? c.longitude.toFixed(4) : c.longitude}
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

        {/* Pagination Footer Toolbar */}
        <div style={{
          background: '#f8fafc',
          padding: '10px 18px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#475569'
        }}>
          <div>
            Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + pageSize, filteredCameras.length)}</strong> of <strong>{filteredCameras.length}</strong> Camera Nodes
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ◀ Prev
            </button>
            
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next ▶
            </button>
          </div>
        </div>
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
