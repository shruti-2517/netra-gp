import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Video, Camera, Upload, Radio, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const DEFAULT_CAMERAS = [
  { id: "cam01", name: "Ahmedabad - SG Highway Iscon Crossroad", city: "Ahmedabad", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam01/index.m3u8" },
  { id: "cam02", name: "Ahmedabad - SG Highway Bopal Junction", city: "Ahmedabad", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam02/index.m3u8" },
  { id: "cam03", name: "Ahmedabad - C G Road Ellisbridge", city: "Ahmedabad", dept: "Municipal Corporation", stream_url: "https://cctv.corp8.cloud/cam03/index.m3u8" },
  { id: "cam04", name: "Ahmedabad - Narol Highway Checkpost", city: "Ahmedabad", dept: "RTO Checkpost", stream_url: "https://cctv.corp8.cloud/cam04/index.m3u8" },
  { id: "cam05", name: "Ahmedabad - SP Ring Road Vaishnodevi", city: "Ahmedabad", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam05/index.m3u8" },
  { id: "cam06", name: "Gandhinagar - GH-5 Circle Central", city: "Gandhinagar", dept: "Home Department", stream_url: "https://cctv.corp8.cloud/cam06/index.m3u8" },
  { id: "cam07", name: "Gandhinagar - CH-0 Circle Secretariat", city: "Gandhinagar", dept: "Home Department", stream_url: "https://cctv.corp8.cloud/cam07/index.m3u8" },
  { id: "cam08", name: "Gandhinagar - Infocity IT Park Gate", city: "Gandhinagar", dept: "Smart City VMS", stream_url: "https://cctv.corp8.cloud/cam08/index.m3u8" },
  { id: "cam09", name: "Gandhinagar - Koba Circle Toll Gate", city: "Gandhinagar", dept: "RTO Checkpost", stream_url: "https://cctv.corp8.cloud/cam09/index.m3u8" },
  { id: "cam10", name: "Gandhinagar - GIFT City Expressway", city: "Gandhinagar", dept: "Smart City VMS", stream_url: "https://cctv.corp8.cloud/cam10/index.m3u8" },
  { id: "cam11", name: "Surat - Ring Road Textile Market", city: "Surat", dept: "Smart City VMS", stream_url: "https://cctv.corp8.cloud/cam11/index.m3u8" },
  { id: "cam12", name: "Surat - Adajan Hazira Highway Junction", city: "Surat", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam12/index.m3u8" },
  { id: "cam13", name: "Surat - Varachha Diamond Market", city: "Surat", dept: "Municipal Corporation", stream_url: "https://cctv.corp8.cloud/cam13/index.m3u8" },
  { id: "cam14", name: "Surat - Udhna Magdalla Highway", city: "Surat", dept: "RTO Checkpost", stream_url: "https://cctv.corp8.cloud/cam14/index.m3u8" },
  { id: "cam15", name: "Surat - Kamrej Toll Plaza Entrance", city: "Surat", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam15/index.m3u8" },
  { id: "cam16", name: "Vadodara - Alkapuri Underpass", city: "Vadodara", dept: "Home Department", stream_url: "https://cctv.corp8.cloud/cam16/index.m3u8" },
  { id: "cam17", name: "Vadodara - Golden Circle Highway", city: "Vadodara", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam17/index.m3u8" },
  { id: "cam18", name: "Vadodara - Sayajigunj Railway Station Circle", city: "Vadodara", dept: "Municipal Corporation", stream_url: "https://cctv.corp8.cloud/cam18/index.m3u8" },
  { id: "cam19", name: "Vadodara - Makarpura Industrial Corridor", city: "Vadodara", dept: "Smart City VMS", stream_url: "https://cctv.corp8.cloud/cam19/index.m3u8" },
  { id: "cam20", name: "Vadodara - Express Highway Checkpost", city: "Vadodara", dept: "RTO Checkpost", stream_url: "https://cctv.corp8.cloud/cam20/index.m3u8" },
  { id: "cam21", name: "Rajkot - Kalawad Road Junction", city: "Rajkot", dept: "RTO Checkpost", stream_url: "https://cctv.corp8.cloud/cam21/index.m3u8" },
  { id: "cam22", name: "Rajkot - 150 Feet Ring Road Circle", city: "Rajkot", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam22/index.m3u8" },
  { id: "cam23", name: "Rajkot - Yagnik Road Market Axis", city: "Rajkot", dept: "Municipal Corporation", stream_url: "https://cctv.corp8.cloud/cam23/index.m3u8" },
  { id: "cam24", name: "Rajkot - Metoda GIDC Industrial Highway", city: "Rajkot", dept: "Smart City VMS", stream_url: "https://cctv.corp8.cloud/cam24/index.m3u8" },
  { id: "cam25", name: "Rajkot - Gondal Highway Checkpost", city: "Rajkot", dept: "Home Department", stream_url: "https://cctv.corp8.cloud/cam25/index.m3u8" },
  { id: "cam26", name: "Bhavnagar - Waghawadi Road Circle", city: "Bhavnagar", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam26/index.m3u8" },
  { id: "cam27", name: "Bhavnagar - Port Highway Junction", city: "Bhavnagar", dept: "RTO Checkpost", stream_url: "https://cctv.corp8.cloud/cam27/index.m3u8" },
  { id: "cam28", name: "Jamnagar - Victoria Bridge Highway", city: "Jamnagar", dept: "Municipal Corporation", stream_url: "https://cctv.corp8.cloud/cam28/index.m3u8" },
  { id: "cam29", name: "Junagadh - Girnar Darwaza Highway", city: "Junagadh", dept: "Police / Traffic", stream_url: "https://cctv.corp8.cloud/cam29/index.m3u8" },
  { id: "cam30", name: "Anand - Amul Dairy Expressway Junction", city: "Anand", dept: "Smart City VMS", stream_url: "https://cctv.corp8.cloud/cam30/index.m3u8" }
];

function CameraCanvasFeed({ cam, isWebcamMode, webcamStream, uploadedImage, onPlateDetected }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [detectedPlate, setDetectedPlate] = useState(null);

  // Live Stream Setup (HLS.js / HTML5 Video)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isWebcamMode && webcamStream) {
      video.srcObject = webcamStream;
      video.play().catch(() => {});
    } else if (!isWebcamMode && cam && cam.stream_url) {
      const streamUrl = cam.stream_url;
      if (streamUrl.includes('.m3u8')) {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          return () => hls.destroy();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.play().catch(() => {});
        }
      } else {
        video.src = streamUrl;
        video.play().catch(() => {});
      }
    }
  }, [cam, isWebcamMode, webcamStream]);

  // Real-time frame capture & Backend OCR scanning for webcam
  useEffect(() => {
    if (!isWebcamMode || !webcamStream) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = 640;
    offscreen.height = 480;
    const octx = offscreen.getContext('2d');

    const scanTimer = setInterval(() => {
      const vid = videoRef.current;
      if (vid && (vid.readyState >= 1 || vid.videoWidth > 0)) {
        try {
          octx.drawImage(vid, 0, 0, 640, 480);
          const b64 = offscreen.toDataURL('image/jpeg', 0.8);

          fetch(`${API_BASE_URL}/api/v1/detections/scan-frame`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_base64: b64,
              camera_id: cam.id || 'CAM-WEBCAM-LIVE'
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data && data.detected && data.license_plate) {
              setDetectedPlate(data.license_plate);
              if (onPlateDetected) onPlateDetected(data.license_plate);
            }
          })
          .catch(() => {});
        } catch (e) {}
      }
    }, 1000);

    return () => clearInterval(scanTimer);
  }, [isWebcamMode, webcamStream, cam]);

  // Handle Uploaded Image Mode
  useEffect(() => {
    if (uploadedImage && isWebcamMode) {
      const img = new Image();
      img.src = uploadedImage;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        fetch(`${API_BASE_URL}/api/v1/detections/scan-frame`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: uploadedImage,
            camera_id: 'CAM-UPLOAD-SCAN'
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.license_plate) {
            setDetectedPlate(data.license_plate);
            if (onPlateDetected) onPlateDetected(data.license_plate);
          }
        })
        .catch(() => {});
      };
    }
  }, [uploadedImage, isWebcamMode]);

  // Live Video Frame Render Loop onto Canvas with Bounding Box Telemetry Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const vid = videoRef.current;

      if (vid && vid.readyState >= 2 && !uploadedImage) {
        ctx.drawImage(vid, 0, 0, width, height);

        // Draw live ANPR YOLO Bounding Box Overlay
        const bx = width * 0.15;
        const by = height * 0.22;
        const bw = width * 0.70;
        const bh = height * 0.60;

        ctx.strokeStyle = detectedPlate ? '#22c55e' : '#fe932c';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = '#002045';
        ctx.fillRect(bx, by - 30, bw, 30);
        ctx.fillStyle = detectedPlate ? '#22c55e' : '#fe932c';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(
          detectedPlate 
            ? `✓ ANPR DETECTED: [ ${detectedPlate} ]` 
            : '● SCANNING STREAM FOR LICENSE PLATE...', 
          bx + 10, 
          by - 10
        );

        ctx.fillStyle = 'rgba(0, 32, 69, 0.85)';
        ctx.fillRect(10, 10, 260, 32);
        ctx.fillStyle = isWebcamMode ? '#fe932c' : '#22c55e';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(
          isWebcamMode 
            ? '● LIVE WEBCAM | 1080p' 
            : `● LIVE SENTINEL | ${cam.id || 'CCTV'}`, 
          18, 
          30
        );
      } else if (!isWebcamMode && !uploadedImage) {
        // Dark slate placeholder while stream loads
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`LOADING LIVE CCTV FEED [ ${cam.id} ]...`, width * 0.22, height * 0.5);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [cam, isWebcamMode, webcamStream, detectedPlate, uploadedImage]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '240px', background: '#0b1c30' }}>
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
      />
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
    </div>
  );
}

export default function VideoWall() {
  const [cameras, setCameras] = useState(DEFAULT_CAMERAS);
  const [currentPage, setCurrentPage] = useState(1);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [latestDetectedPlate, setLatestDetectedPlate] = useState(null);
  const fileInputRef = useRef(null);

  // Dynamically fetch camera catalogue from backend API (/api/ingest)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ingest`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedCams = data.map(c => ({
            id: c.camera_id || c.id,
            name: c.name,
            city: c.city,
            dept: c.department || "Traffic Police",
            speedLimit: c.speed_limit || 80,
            stream_url: c.stream_url || (c.endpoints && c.endpoints.hls ? c.endpoints.hls : `https://cctv.corp8.cloud/${c.camera_id || c.id}/index.m3u8`),
            vehicles: c.vehicles || []
          }));
          setCameras(mappedCams);
        }
      })
      .catch(() => {});
  }, []);

  const toggleWebcam = async () => {
    if (isWebcamActive && !uploadedImage) {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
      setWebcamStream(null);
      setIsWebcamActive(false);
      setLatestDetectedPlate(null);
    } else {
      setUploadedImage(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        setWebcamStream(stream);
        setIsWebcamActive(true);
      } catch (err) {
        alert("Webcam Notice: " + err.message + "\n\nTip: If you are running Python in a terminal, stop it first or use the 'Upload Vehicle Image' button next to this to test any image directly!");
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
      setUploadedImage(event.target.result);
      setIsWebcamActive(true);
      setLatestDetectedPlate("SCANNING IMAGE...");
    };
    reader.readAsDataURL(file);
  };

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

        {/* Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 700, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              ◀ Prev
            </button>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1e293b' }}>
              Grid Page {currentPage} / {Math.ceil(cameras.length / 4)} ({cameras.length} Live Feeds)
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(cameras.length / 4), p + 1))}
              disabled={currentPage >= Math.ceil(cameras.length / 4)}
              style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 700, cursor: currentPage >= Math.ceil(cameras.length / 4) ? 'not-allowed' : 'pointer', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              Next ▶
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 12px' }}
          >
            <Upload size={14} />
            Upload Vehicle Image / Test Plate
          </button>

          <button
            onClick={toggleWebcam}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '4px',
              border: (isWebcamActive && !uploadedImage) ? '1px solid #ba1a1a' : '1px solid #15803d',
              background: (isWebcamActive && !uploadedImage) ? '#ba1a1a' : '#15803d',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Camera size={15} />
            {isWebcamActive && !uploadedImage ? "Stop Webcam" : "Test Live Laptop Camera"}
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
        {cameras.slice((currentPage - 1) * 4, currentPage * 4).map((cam, idx) => {
          const isThisWebcam = isWebcamActive && currentPage === 1 && idx === 0;

          return (
            <div 
              key={cam.id}
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
                    {isThisWebcam ? (uploadedImage ? "CAM-IMAGE-SCAN" : "CAM-WEBCAM-LIVE") : cam.id}
                  </span>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', margin: '2px 0 0 0' }}>
                    {isThisWebcam ? (uploadedImage ? "Scanned Vehicle Image" : "Your Live Laptop Camera Feed") : cam.name}
                  </h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#adc7f7', fontFamily: 'var(--font-body)' }}>{cam.city}</span>
                </div>
              </div>

              {/* Video Canvas Viewport */}
              <CameraCanvasFeed
                cam={cam}
                isWebcamMode={isThisWebcam}
                webcamStream={webcamStream}
                uploadedImage={uploadedImage}
                onPlateDetected={(plate) => setLatestDetectedPlate(plate)}
              />

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
                  <strong style={{ color: '#1a365d' }}>{cam.dept}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#74777f', fontSize: '11px' }}>LATEST DETECTED:</span>
                  <span style={{
                    background: '#dcfce7',
                    color: '#14532d',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700
                  }}>
                    {isThisWebcam ? (latestDetectedPlate || "SCANNING...") : (cam.vehicles && cam.vehicles[0] ? cam.vehicles[0].plate : "STANDBY")}
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
