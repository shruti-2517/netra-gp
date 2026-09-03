import React, { useState } from 'react';
import { Maximize2, Cpu, Video, ShieldCheck, Activity, Camera, Radio } from 'lucide-react';

const CAMERA_FEEDS = [
  {
    id: "CAM-AHM-001",
    name: "SG Highway - Iscon Crossroad",
    city: "Ahmedabad",
    dept: "Traffic Police",
    url: "/sample_feeds/traffic1.mp4",
    liveStream: "http://localhost:8000/api/v1/streams/live/CAM-AHM-001"
  },
  {
    id: "CAM-GND-002",
    name: "GH-5 Circle",
    city: "Gandhinagar",
    dept: "Municipal Corp",
    url: "/sample_feeds/120678-721759752_medium.mp4",
    liveStream: "http://localhost:8000/api/v1/streams/live/CAM-GND-002"
  },
  {
    id: "CAM-SRT-003",
    name: "Ring Road - Textile Market",
    city: "Surat",
    dept: "Smart City VMS",
    url: "/sample_feeds/153283-804933523_medium.mp4",
    liveStream: "http://localhost:8000/api/v1/streams/live/CAM-SRT-003"
  },
  {
    id: "CAM-BRD-004",
    name: "Alkapuri Underpass",
    city: "Vadodara",
    dept: "Home Dept",
    url: "/sample_feeds/154195-807166827_medium.mp4",
    liveStream: "http://localhost:8000/api/v1/streams/live/CAM-BRD-004"
  }
];

export default function VideoWall() {
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [streamMode, setStreamMode] = useState('live_yolo'); // 'live_yolo' or 'webcam' or 'mp4'

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
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#002045', margin: 0 }}>Unified Multi-Stream Live Video Wall</h2>
            <p style={{ fontSize: '12px', color: '#43474e', margin: 0 }}>Model 2: Live Computer Vision Ingestion (OpenCV + YOLOv8 + EasyOCR)</p>
          </div>
        </div>

        {/* Stream Source Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setStreamMode('live_yolo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '4px',
              border: streamMode === 'live_yolo' ? '1px solid #1a365d' : '1px solid #c4c6cf',
              background: streamMode === 'live_yolo' ? '#002045' : '#ffffff',
              color: streamMode === 'live_yolo' ? '#ffffff' : '#191c1e',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Radio size={14} color={streamMode === 'live_yolo' ? '#fe932c' : '#74777f'} />
            Live AI Vision Stream (YOLO Overlays)
          </button>

          <button
            onClick={() => setStreamMode('webcam')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '4px',
              border: streamMode === 'webcam' ? '1px solid #15803d' : '1px solid #c4c6cf',
              background: streamMode === 'webcam' ? '#15803d' : '#ffffff',
              color: streamMode === 'webcam' ? '#ffffff' : '#191c1e',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Camera size={14} />
            Test Live Laptop Webcam
          </button>
        </div>
      </div>

      {/* 2x2 Video Wall Matrix */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '18px',
        flex: 1
      }}>
        {CAMERA_FEEDS.map((feed, idx) => {
          const streamUrl = (streamMode === 'webcam' && idx === 0)
            ? "http://localhost:8000/api/v1/streams/live/WEBCAM"
            : feed.liveStream;

          return (
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
                    {streamMode === 'webcam' && idx === 0 ? "CAM-WEBCAM-LIVE" : feed.id}
                  </span>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', margin: '2px 0 0 0' }}>
                    {streamMode === 'webcam' && idx === 0 ? "Your Live Laptop Camera Feed" : feed.name}
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

              {/* Video / Live Stream Viewport */}
              <div style={{ position: 'relative', background: '#0b1c30', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img 
                  src={streamUrl}
                  alt={`Live Stream ${feed.id}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to video tag if backend live stream is starting
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                  }}
                />

                <video 
                  src={feed.url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'none' }}
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
                  ● LIVE STREAM | 1080p YOLOv8
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
                  <span style={{ color: '#74777f', fontSize: '11px' }}>AI STATUS:</span>
                  <span style={{
                    background: '#dcfce7',
                    color: '#14532d',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700
                  }}>
                    YOLO INFERENCE ON
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
