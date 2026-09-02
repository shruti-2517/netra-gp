import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Search, Filter, Trash2 } from 'lucide-react';

const DEFAULT_WATCHLIST = [
  {
    watchlist_id: "WL-001",
    license_plate: "GJ01AB1234",
    vehicle_make: "Hyundai Creta",
    color: "White",
    reason: "Stolen Vehicle FIR #2026/089",
    category: "STOLEN",
    threat_level: "HIGH",
    owner_name: "Unknown Suspect"
  },
  {
    watchlist_id: "WL-002",
    license_plate: "GJ18CD5678",
    vehicle_make: "Mahindra Scorpio",
    color: "Black",
    reason: "Wanted in Robbery Case (Crime Branch)",
    category: "CRIMINAL_WANTED",
    threat_level: "CRITICAL",
    owner_name: "Ramesh Patel"
  },
  {
    watchlist_id: "WL-003",
    license_plate: "GJ05EF9012",
    vehicle_make: "Maruti Swift",
    color: "Silver",
    reason: "Expired Permit / Suspicious Registration",
    category: "TRAFFIC_VIOLATION",
    threat_level: "MEDIUM",
    owner_name: "Suresh Shah"
  }
];

export default function WatchlistManager() {
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
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
    fetch('http://localhost:8000/api/v1/watchlist')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setWatchlist(data);
      })
      .catch(() => {});
  }, []);

  const handleAddVehicle = (e) => {
    e.preventDefault();
    const created = {
      ...newVehicle,
      watchlist_id: newVehicle.watchlist_id || `WL-00${watchlist.length + 1}`
    };
    setWatchlist([created, ...watchlist]);
    setShowAddModal(false);

    fetch('http://localhost:8000/api/v1/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).catch(() => {});
  };

  const handleDelete = (watchlist_id) => {
    setWatchlist(watchlist.filter(w => w.watchlist_id !== watchlist_id));
    fetch(`http://localhost:8000/api/v1/watchlist/${watchlist_id}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  const filteredWatchlist = watchlist.filter(w => {
    const matchesSearch = w.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.watchlist_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || w.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ flex: 1, padding: '20px', background: '#0f172a', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Watchlist & Hotlist Vehicle Database</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Real-Time ANPR Matching Engine Target List (Stolen Vehicles, Crime Suspects, Violators)</p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={15} /> Add Vehicle to Watchlist
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by License Plate, FIR / Reason, or Watchlist ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} color="#94a3b8" />
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="ALL">All Categories</option>
            <option value="STOLEN">Stolen Vehicle</option>
            <option value="CRIMINAL_WANTED">Criminal Wanted</option>
            <option value="TRAFFIC_VIOLATION">Traffic Violation</option>
          </select>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table-container">
          <thead>
            <tr>
              <th>Watchlist ID</th>
              <th>Target License Plate</th>
              <th>Threat Level</th>
              <th>Category</th>
              <th>Vehicle Make & Color</th>
              <th>Reason / FIR Details</th>
              <th>Owner / Suspect</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWatchlist.map(item => (
              <tr key={item.watchlist_id}>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#94a3b8' }}>{item.watchlist_id}</span>
                </td>
                <td>
                  <span className="license-plate-badge">{item.license_plate}</span>
                </td>
                <td>
                  <span className={
                    item.threat_level === 'CRITICAL' ? 'badge-threat-critical' :
                    item.threat_level === 'HIGH' ? 'badge-threat-high' : 'badge-threat-medium'
                  }>
                    {item.threat_level}
                  </span>
                </td>
                <td>
                  <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>
                    {item.category}
                  </span>
                </td>
                <td>{item.color} {item.vehicle_make}</td>
                <td style={{ color: '#f43f5e', fontWeight: 600 }}>{item.reason}</td>
                <td>{item.owner_name}</td>
                <td>
                  <button 
                    onClick={() => handleDelete(item.watchlist_id)}
                    style={{ background: 'rgba(244,63,94,0.12)', border: 'none', color: '#f43f5e', padding: '5px', borderRadius: '6px', cursor: 'pointer' }}
                    title="Remove from Watchlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
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
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>Add Target Vehicle to Hotlist Watchlist</h3>
            <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Target License Plate Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. GJ01AB1234" 
                  value={newVehicle.license_plate}
                  onChange={e => setNewVehicle({ ...newVehicle, license_plate: e.target.value.toUpperCase() })}
                  className="input-field" 
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select 
                    value={newVehicle.category}
                    onChange={e => setNewVehicle({ ...newVehicle, category: e.target.value })}
                    className="input-field" 
                    style={{ width: '100%' }}
                  >
                    <option value="STOLEN">STOLEN</option>
                    <option value="CRIMINAL_WANTED">CRIMINAL_WANTED</option>
                    <option value="TRAFFIC_VIOLATION">TRAFFIC_VIOLATION</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Threat Level</label>
                  <select 
                    value={newVehicle.threat_level}
                    onChange={e => setNewVehicle({ ...newVehicle, threat_level: e.target.value })}
                    className="input-field" 
                    style={{ width: '100%' }}
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Vehicle Make & Model</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hyundai Creta" 
                    value={newVehicle.vehicle_make}
                    onChange={e => setNewVehicle({ ...newVehicle, vehicle_make: e.target.value })}
                    className="input-field" 
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Vehicle Color</label>
                  <input 
                    type="text" 
                    placeholder="e.g. White" 
                    value={newVehicle.color}
                    onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    className="input-field" 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Reason / FIR Case Details</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Stolen Vehicle FIR #2026/089" 
                  value={newVehicle.reason}
                  onChange={e => setNewVehicle({ ...newVehicle, reason: e.target.value })}
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
                  Save to Hotlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
