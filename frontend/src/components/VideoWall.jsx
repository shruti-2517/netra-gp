import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Video, Camera, Upload, Radio, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

function CameraCanvasFeed({ cam, isWebcamMode, webcamStream, uploadedImage, onPlateDetected }) {
  const videoRef = useRef(null);
  const [detectedPlate, setDetectedPlate] = useState(null);
  const [useBackendImg, setUseBackendImg] = useState(false);

  // Stream & HLS Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isWebcamMode && webcamStream) {
      video.srcObject = webcamStream;
      video.play().catch(() => { });
    } else if (!isWebcamMode && cam && !useBackendImg) {
      let streamUrl = cam.stream_url || `https://cctv.corp8.cloud/${cam.id}/index.m3u8`;

      if (streamUrl && streamUrl.includes('.m3u8')) {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            manifestLoadingTimeOut: 4000
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => { });
          });
          hls.on(window.Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              hls.destroy();
              setUseBackendImg(true);
            }
          });
          return () => hls.destroy();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.play().catch(() => {
            setUseBackendImg(true);
          });
        } else {
          setUseBackendImg(true);
        }
      } else {
        setUseBackendImg(true);
      }
    }
  }, [cam, isWebcamMode, webcamStream, useBackendImg]);

  // Handle Uploaded Image Mode
  useEffect(() => {
    if (uploadedImage && isWebcamMode) {
      fetch(`${API_BASE_URL}/api/v1/detections/scan-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        .catch(() => { });
    }
  }, [uploadedImage, isWebcamMode, onPlateDetected]);

  const backendStreamUrl = `${API_BASE_URL}/api/v1/streams/live/${cam.id || 'cam01'}`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '240px', background: '#0b1c30', overflow: 'hidden' }}>
      {isWebcamMode && webcamStream ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : uploadedImage && isWebcamMode ? (
        <img
          src={uploadedImage}
          alt="Scanned Vehicle"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : !useBackendImg ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setUseBackendImg(true)}
        />
      ) : (
        <img
          src={backendStreamUrl}
          alt={`Live Feed ${cam.id}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
          }}
        />
      )}

      {/* Live ANPR HUD Telemetry Overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 32, 69, 0.85)',
        padding: '4px 10px',
        borderRadius: '4px',
        color: '#22c55e',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backdropFilter: 'blur(2px)'
      }}>
        <span>● LIVE STREAM | {isWebcamMode ? (uploadedImage ? "IMAGE SCAN" : "WEBCAM") : (cam.id || "CCTV")}</span>
      </div>

      {/* Telemetry Banner */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        right: '10px',
        background: 'rgba(0, 32, 69, 0.90)',
        border: '1.5px solid #22c55e',
        padding: '6px 12px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ffffff',
        fontSize: '11px',
        backdropFilter: 'blur(2px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#22c55e', fontWeight: 800 }}>
            ● BACKEND OPENCV + YOLOv8 + EASYOCR ACTIVE
          </span>
          {detectedPlate && (
            <span style={{
              background: '#ffffff',
              color: '#002045',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px'
            }}>
              {detectedPlate}
            </span>
          )}
        </div>
        <span style={{ fontSize: '10px', color: '#adc7f7', fontFamily: 'var(--font-mono)' }}>
          {cam.city || 'GUJARAT'}
        </span>
      </div>
    </div>
  );
}

export default function VideoWall() {
  const [cameras, setCameras] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [latestDetectedPlate, setLatestDetectedPlate] = useState(null);
  const fileInputRef = useRef(null);

  // Dynamically fetch camera catalogue from backend API (/api/ingest)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ingest`, { credentials: 'include' })
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
      .catch(() => { });
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
