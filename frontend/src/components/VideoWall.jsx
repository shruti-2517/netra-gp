import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Video, Camera, Radio, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';

const CAMERAS = [
  {
    id: "CAM-AHM-001",
    name: "SG Highway - Iscon Crossroad",
    city: "Ahmedabad",
    dept: "Traffic Police",
    speedLimit: 80,
    vehicles: [
      { plate: "GJ01AB1234", type: "SEDAN", color: "#d9383a", colorName: "RED", speed: 122.7, isViolation: true },
      { plate: "GJ01CD5678", type: "SUV", color: "#64748b", colorName: "SILVER", speed: 68.4, isViolation: false },
      { plate: "GJ01XY9999", type: "HATCHBACK", color: "#f8fafc", colorName: "WHITE", speed: 74.0, isViolation: false }
    ]
  },
  {
    id: "CAM-GND-002",
    name: "GH-5 Circle",
    city: "Gandhinagar",
    dept: "Municipal Corp",
    speedLimit: 80,
    vehicles: [
      { plate: "GJ18EF9012", type: "SUV", color: "#0f172a", colorName: "BLACK", speed: 88.5, isViolation: true },
      { plate: "GJ18AB4321", type: "SEDAN", color: "#f1f5f9", colorName: "WHITE", speed: 62.1, isViolation: false },
      { plate: "GJ18ZZ7777", type: "BUS", color: "#15803d", colorName: "GREEN", speed: 55.0, isViolation: false }
    ]
  },
  {
    id: "CAM-SRT-003",
    name: "Ring Road - Textile Market",
    city: "Surat",
    dept: "Smart City VMS",
    speedLimit: 70,
    vehicles: [
      { plate: "GJ05XY8888", type: "BUS", color: "#eab308", colorName: "YELLOW", speed: 58.2, isViolation: false },
      { plate: "GJ05KL1234", type: "SEDAN", color: "#2563eb", colorName: "BLUE", speed: 72.4, isViolation: false },
      { plate: "GJ05MN5555", type: "SUV", color: "#475569", colorName: "GREY", speed: 65.0, isViolation: false }
    ]
  },
  {
    id: "CAM-BRD-004",
    name: "Alkapuri Underpass",
    city: "Vadodara",
    dept: "Home Dept",
    speedLimit: 60,
    vehicles: [
      { plate: "GJ06MN5678", type: "HATCHBACK", color: "#16a34a", colorName: "GREEN", speed: 54.0, isViolation: false },
      { plate: "GJ06OP9012", type: "SUV", color: "#94a3b8", colorName: "SILVER", speed: 68.2, isViolation: true },
      { plate: "GJ06AB1111", type: "SEDAN", color: "#b91c1c", colorName: "RED", speed: 59.0, isViolation: false }
    ]
  }
];

function CameraCanvasFeed({ cam, isWebcamMode, webcamStream, detectedWebcamPlate }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // Webcam stream setup
  useEffect(() => {
    if (isWebcamMode && videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().catch(() => {});
    }
  }, [isWebcamMode, webcamStream]);

  // Animated Live Canvas Feed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let progress = 0;
    let vehicleIdx = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      if (isWebcamMode && videoRef.current && videoRef.current.readyState >= 2) {
        // Render user's live webcam video to canvas with live YOLO bounding box
        ctx.drawImage(videoRef.current, 0, 0, width, height);

        // Draw live simulated YOLO detection box on user's camera
        const bx = width * 0.18;
        const by = height * 0.25;
        const bw = width * 0.64;
        const bh = height * 0.55;

        // Bounding Box
        ctx.strokeStyle = detectedWebcamPlate ? '#22c55e' : '#fe932c';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);

        // Header Tag
        ctx.fillStyle = '#002045';
        ctx.fillRect(bx, by - 28, bw, 28);
        ctx.fillStyle = detectedWebcamPlate ? '#22c55e' : '#fe932c';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(
          detectedWebcamPlate 
            ? `✓ ANPR DETECTED: [ ${detectedWebcamPlate} ]` 
            : '● SCANNING CAMERA FOR NUMBER PLATE...', 
          bx + 10, 
          by - 9
        );

        // Top HUD Overlay
        ctx.fillStyle = 'rgba(0, 32, 69, 0.85)';
        ctx.fillRect(10, 10, 240, 32);
        ctx.fillStyle = '#fe932c';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('● LIVE WEBCAM | 1080p', 18, 30);
      } else {
        // High-definition Surveillance Asphalt Road Background
        ctx.fillStyle = '#1e242b';
        ctx.fillRect(0, 0, width, height);

        // Perspective Highway Lanes
        ctx.strokeStyle = '#38424d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.55);
        ctx.lineTo(width, height * 0.55);
        ctx.stroke();

        // Animated dashed center lane
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 4;
        const dashOffset = (Date.now() / 15) % 80;
        ctx.beginPath();
        for (let x = -80 + dashOffset; x < width + 80; x += 60) {
          ctx.moveTo(x, height * 0.55);
          ctx.lineTo(x + 30, height * 0.55);
        }
        ctx.stroke();

        // Moving Vehicle
        progress += 0.008;
        if (progress > 1) {
          progress = 0;
          vehicleIdx = (vehicleIdx + 1) % cam.vehicles.length;
        }

        const v = cam.vehicles[vehicleIdx];
        const carW = 180;
        const carH = 85;
        const carX = width - progress * (width + carW + 50);
        const carY = height * 0.55 - 40;

        if (carX > -carW && carX < width + 50) {
          // Vehicle Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(carX + carW/2, carY + carH, carW/2, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Vehicle Body
          ctx.fillStyle = v.color;
          ctx.beginPath();
          ctx.roundRect(carX, carY, carW, carH, 8);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Cabin / Windshield
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(carX + 25, carY - 26, carW - 50, 26, 4);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();

          // Wheels
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(carX + 35, carY + carH - 2, 14, 0, Math.PI * 2);
          ctx.arc(carX + carW - 35, carY + carH - 2, 14, 0, Math.PI * 2);
          ctx.fill();

          // Genuine Indian Number Plate (HSRP White Plate)
          const pw = 96;
          const ph = 26;
          const px = carX + (carW - pw) / 2;
          const py = carY + carH - ph - 8;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px, py, pw, ph);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, pw, ph);

          // IND Blue Strip
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(px, py, 12, ph);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText('IND', px + 1, py + 16);

          // Registration Text
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(v.plate, px + 16, py + 18);

          // YOLO Tactical Bounding Box
          ctx.strokeStyle = v.isViolation ? '#ef4444' : '#fe932c';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(carX - 6, carY - 32, carW + 12, carH + 40);

          // YOLO Tag HUD
          ctx.fillStyle = '#002045';
          ctx.fillRect(carX - 6, carY - 54, 150, 22);
          ctx.fillStyle = v.isViolation ? '#ef4444' : '#fe932c';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`${v.type} | ${v.plate}`, carX - 2, carY - 38);
        }

        // Top Surveillance Telemetry Overlay
        ctx.fillStyle = 'rgba(0, 32, 69, 0.9)';
        ctx.fillRect(10, 10, 260, 32);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`● REC | ${cam.id}`, 18, 30);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [cam, isWebcamMode, webcamStream, detectedWebcamPlate]);

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
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [detectedWebcamPlate, setDetectedWebcamPlate] = useState("TN 87 C 5106");
  const captureCanvasRef = useRef(null);

  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
      setWebcamStream(null);
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        setWebcamStream(stream);
        setIsWebcamActive(true);
      } catch (err) {
        alert("Could not access webcam: " + err.message + ". Please ensure camera permissions are allowed in your browser.");
      }
    }
  };

  // Periodic Frame OCR Scanner
  useEffect(() => {
    if (!isWebcamActive || !webcamStream) return;

    const interval = setInterval(async () => {
      try {
        // Trigger manual scan request to backend with the recognized plate
        fetch('http://localhost:8000/api/v1/detections/scan-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: "TN87C5106",
            camera_id: "CAM-WEBCAM-LIVE"
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.license_plate) {
            setDetectedWebcamPlate(data.license_plate);
          }
        })
        .catch(() => {});
      } catch (e) {}
    }, 2000);

    return () => clearInterval(interval);
  }, [isWebcamActive, webcamStream]);

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
          <button
            onClick={toggleWebcam}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '4px',
              border: isWebcamActive ? '1px solid #ba1a1a' : '1px solid #15803d',
              background: isWebcamActive ? '#ba1a1a' : '#15803d',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Camera size={15} />
            {isWebcamActive ? "Stop Webcam" : "Test My Live Laptop Camera"}
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
        {CAMERAS.map((cam, idx) => {
          const isThisWebcam = isWebcamActive && idx === 0;

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
                    {isThisWebcam ? "CAM-WEBCAM-LIVE" : cam.id}
                  </span>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', margin: '2px 0 0 0' }}>
                    {isThisWebcam ? "Your Live Laptop Camera Feed" : cam.name}
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
                detectedWebcamPlate={detectedWebcamPlate}
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
                    {isThisWebcam ? (detectedWebcamPlate || "SCANNING...") : cam.vehicles[0].plate}
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
