import React, { useState } from 'react';
import { Maximize2, Cpu, Video, ShieldCheck, Activity } from 'lucide-react';

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
    <div style={{ flex: 1, padding: '24px', background: '#f7f9fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '14px 20px',
        borderRadius: '8px',
        border: '1px solid #c4c6cf',
        boxShadow: '0 2px 6px rgba(0, 32, 69, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(26, 54, 93, 0.1)', color: '#1a365d', padding: '8px', borderRadius: '6px' }}>
            <Video size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#002045', margin: 0 }}>Unified Multi-Stream Video Wall</h2>
            <p style={{ fontSize: '12px', color: '#43474e', margin: 0 }}>Model 2: Parallel Stream Ingestion (RTSP over TCP / WebRTC WHEP / HLS)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#dcfce7',
            color: '#14532d',
            border: '1px solid #86efac',
            padding: '4px 10px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803d' }}></span>
            ANPR INGESTION ACTIVE
          </span>
        </div>
      </div>

      {/* 2x2 Video Wall Matrix */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '18px',
        flex: 1
      }}>
        {CAMERA_FEEDS.map((feed) => (
          <div 
            key={feed.id}
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #c4c6cf',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0, 32, 69, 0.08)'
            }}
          >
            {/* Feed Header */}
            <div style={{
              background: '#002045',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #fe932c'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#fe932c' }}>
                  {feed.id}
                </span>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', margin: '2px 0 0 0' }}>
                  {feed.name}
                </h4>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#adc7f7', fontFamily: 'var(--font-body)' }}>{feed.city}</span>
                <button 
                  onClick={() => setSelectedFeed(feed)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>

            {/* Video Viewport */}
            <div style={{ position: 'relative', background: '#0b1c30', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video 
                src={feed.url} 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Live Overlay HUD */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0, 32, 69, 0.85)',
                color: '#fe932c',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                border: '1px solid rgba(254, 147, 44, 0.4)'
              }}>
                ● REC | 1080p H.264
              </div>
            </div>

            {/* Bottom ANPR Telemetry Strip */}
            <div style={{
              background: '#f2f4f6',
              padding: '10px 14px',
              borderTop: '1px solid #e0e3e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <div>
                <span style={{ color: '#74777f', fontSize: '11px', fontWeight: 600 }}>DEPARTMENT: </span>
                <strong style={{ color: '#1a365d' }}>{feed.dept}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#74777f', fontSize: '11px' }}>LATEST OCR:</span>
                <span className="license-plate-badge" style={{ fontSize: '12px' }}>GJ01AB1234</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
