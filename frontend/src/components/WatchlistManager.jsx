import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Search, Filter, Trash2, AlertOctagon } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function WatchlistManager() {
  const [watchlist, setWatchlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    watchlist_id: '',
    license_plate: '',
    vehicle_make: '',
    color: '',
    reason: '',
    category: 'STOLEN',
    threat_level: 'HIGH',
    owner_name: ''
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/watchlist`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) setWatchlist(data);
      })
      .catch(() => {});
  }, []);

  const handleAddVehicle = (e) => {
    e.preventDefault();
    const created = {
      ...newVehicle,
      watchlist_id: newVehicle.watchlist_id || `WL-${Date.now().toString().slice(-4)}`
    };
    setWatchlist([created, ...watchlist]);
    setShowAddModal(false);

    fetch(`${API_BASE_URL}/api/v1/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).catch(() => {});
  };

  const filteredWatchlist = watchlist.filter(v => {
    const matchesSearch = v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (v.reason && v.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (v.owner_name && v.owner_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || v.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ flex: 1, padding: '24px', background: '#f7f9fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={20} color="#ba1a1a" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#002045', margin: 0 }}>
              State Police Watchlist Database & Hotlist Intercept Registry
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: '#43474e', margin: '4px 0 0 0' }}>
            Real-Time Watchlist Correlation Engine: Exact, Canonical, and Levenshtein Fuzzy Matching
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-accent"
        >
          <Plus size={15} /> Add Watchlist Target
        </button>
      </div>

      {/* Search & Filter Bar */}
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
            placeholder="Search by License Plate (e.g. GJ01HY5842), Reason, or Owner..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#191c1e', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#74777f" />
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="input-field"
            style={{ fontWeight: 600 }}
          >
            <option value="ALL">All Threat Categories</option>
            <option value="STOLEN">Stolen Vehicles</option>
            <option value="CRIMINAL_WANTED">Criminal Wanted</option>
            <option value="TRAFFIC_VIOLATION">Traffic Violations</option>
          </select>
        </div>
      </div>

      {/* Watchlist Table */}
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
              <th>WATCHLIST ID</th>
              <th>TARGET REGISTRATION</th>
              <th>VEHICLE SPECIFICATION</th>
              <th>THREAT LEVEL</th>
              <th>CATEGORY</th>
              <th>FIR / REASON FOR ALERT</th>
              <th>REGISTERED OWNER</th>
            </tr>
          </thead>
          <tbody>
            {filteredWatchlist.map(v => (
              <tr key={v.watchlist_id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1a365d' }}>{v.watchlist_id}</td>
                <td>
                  <span className="license-plate-badge" style={{ fontSize: '13px' }}>{v.license_plate}</span>
                </td>
                <td style={{ fontWeight: 600, color: '#002045' }}>
                  {v.color} {v.vehicle_make}
                </td>
                <td>
                  <span className={
                    v.threat_level === 'CRITICAL' ? 'badge-threat-critical' : v.threat_level === 'HIGH' ? 'badge-threat-high' : 'badge-threat-medium'
                  }>
                    {v.threat_level}
                  </span>
                </td>
                <td>
                  <span style={{
                    background: '#f2f4f6',
                    color: '#1a365d',
                    border: '1px solid #c4c6cf',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700
                  }}>
                    {v.category}
                  </span>
                </td>
                <td style={{ color: '#ba1a1a', fontWeight: 600 }}>{v.reason}</td>
                <td style={{ color: '#43474e' }}>{v.owner_name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
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
            border: '2px solid #ba1a1a',
            borderRadius: '8px',
            padding: '24px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 32, 69, 0.25)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ba1a1a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} /> Register Target in State Watchlist DB
            </h3>

            <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>LICENSE PLATE (IND SYNTAX)</label>
                <input 
                  type="text" 
                  placeholder="e.g. GJ01XY9999" 
                  value={newVehicle.license_plate} 
                  onChange={e => setNewVehicle({ ...newVehicle, license_plate: e.target.value.toUpperCase() })} 
                  className="input-field"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>VEHICLE MAKE / MODEL</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Toyota Fortuner" 
                    value={newVehicle.vehicle_make} 
                    onChange={e => setNewVehicle({ ...newVehicle, vehicle_make: e.target.value })} 
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>COLOR</label>
                  <input 
                    type="text" 
                    placeholder="e.g. White / Silver" 
                    value={newVehicle.color} 
                    onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })} 
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>THREAT CLASSIFICATION</label>
                  <select 
                    value={newVehicle.threat_level} 
                    onChange={e => setNewVehicle({ ...newVehicle, threat_level: e.target.value })} 
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="CRITICAL">CRITICAL (Red Alert)</option>
                    <option value="HIGH">HIGH (Intercept)</option>
                    <option value="MEDIUM">MEDIUM (Monitor)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>CATEGORY</label>
                  <select 
                    value={newVehicle.category} 
                    onChange={e => setNewVehicle({ ...newVehicle, category: e.target.value })} 
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="STOLEN">Stolen Vehicle</option>
                    <option value="CRIMINAL_WANTED">Criminal Wanted</option>
                    <option value="TRAFFIC_VIOLATION">Traffic Violation</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#43474e', marginBottom: '4px' }}>FIR / REASON FOR INTERCEPTION</label>
                <input 
                  type="text" 
                  placeholder="e.g. Navrangpura Police Station FIR #128/2026" 
                  value={newVehicle.reason} 
                  onChange={e => setNewVehicle({ ...newVehicle, reason: e.target.value })} 
                  className="input-field"
                  style={{ width: '100%' }}
                  required
                />
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
                  className="btn-accent"
                >
                  Save Watchlist Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
