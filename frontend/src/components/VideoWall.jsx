import React, { useState } from 'react';
import { Maximize2, Cpu } from 'lucide-react';

const CAMERA_FEEDS = [
  {
    id: "CAM-AHM-001",
    name: "SG Highway - Iscon Crossroad",
    city: "Ahmedabad",
    dept: "Traffic Police",
    url: "data/sample_feeds/traffic1.mp4"
  },
  {
    id: "CAM-GND-002",
    name: "GH-5 Circle",
    city: "Gandhinagar",
    dept: "Municipal Corp",
    url: "data/sample_feeds/120678-721759752_medium.mp4"
  },
  {
    id: "CAM-SRT-003",
    name: "Ring Road - Textile Market",
    city: "Surat",
    dept: "Smart City VMS",
    url: "data/sample_feeds/153283-804933523_medium.mp4"
  },
  {
    id: "CAM-BRD-004",
    name: "Alkapuri Underpass",
    city: "Vadodara",
    dept: "Home Dept",
    url: "data/sample_feeds/154195-807166827_medium.mp4"
  }
];

export default function VideoWall() {
  const [selectedFeed, setSelectedFeed] = useState(null);

  return (
    <div style={{ flex: 1, padding: '20px', background: '#0f172a', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#1e293b',
        padding: '12px 18px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '6px', borderRadius: '6px' }}>
            <Cpu size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Unified Live Video Wall</h2>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Model 2: Parallel Stream Ingestion (RTSP over TCP / WebRTC / HLS)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setSelectedFeed(null)}
            style={{
              background: selectedFeed === null ? '#334155' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            2x2 Grid View
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedFeed ? '1fr' : '1fr 1fr',
        gap: '16px',
        flex: 1
      }}>
        {CAMERA_FEEDS.filter(f => selectedFeed === null || f.id === selectedFeed).map(feed => (
          <div 
            key={feed.id}
            style={{
              position: 'relative',
              background: '#1e293b',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '280px'
            }}
          >
            {/* Top Video Header Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              background: 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '2px 6px', borderRadius: '4px' }}>{feed.id}</span>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{feed.name} ({feed.city})</h4>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-pill status-active" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  <span className="status-dot"></span> LIVE
                </span>
                <button 
                  onClick={() => setSelectedFeed(selectedFeed === feed.id ? null : feed.id)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div style={{ position: 'relative', flex: 1, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video 
                src={feed.url} 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
