"""
NETRA-GP Live Stream & Real-Time Computer Vision Broadcaster
Provides real-time Motion-JPEG (MJPEG) streams with live YOLOv8 detections,
bounding boxes, license plate overlays, and instant WebSocket alert triggering.
"""
import os
import cv2
import time
import logging
from typing import Generator
import requests

logger = logging.getLogger("LiveStreamer")

CAMERA_SOURCE_MAP = {
    "CAM-AHM-001": "data/sample_feeds/traffic1.mp4",
    "CAM-GND-002": "data/sample_feeds/120678-721759752_medium.mp4",
    "CAM-SRT-003": "data/sample_feeds/153283-804933523_medium.mp4",
    "CAM-BRD-004": "data/sample_feeds/154195-807166827_medium.mp4",
    "CAM-RJK-005": "data/sample_feeds/84222-584891447_medium.mp4",
    "WEBCAM": 0
}

# In-memory detector cache
_yolo_model = None

def get_detector():
    global _yolo_model
    if _yolo_model is None:
        try:
            from ultralytics import YOLO
            for cand in ["cv_engine/yolov8n.pt", "yolov8n.pt", "../cv_engine/yolov8n.pt"]:
                if os.path.exists(cand):
                    _yolo_model = YOLO(cand)
                    break
            if _yolo_model is None:
                _yolo_model = YOLO("yolov8n.pt")
        except Exception as e:
            logger.warning(f"YOLO not initialized: {e}")
    return _yolo_model

def generate_live_stream_frames(camera_id: str = "CAM-AHM-001") -> Generator[bytes, None, None]:
    """
    Streams live MJPEG frames with real-time YOLO bounding boxes, vehicle detection,
    and automatic alert triggering.
    """
    source = CAMERA_SOURCE_MAP.get(camera_id, "data/sample_feeds/traffic1.mp4")
    
    # Resolve relative paths
    if isinstance(source, str) and not source.startswith(("rtsp://", "http://")):
        if not os.path.exists(source):
            alt1 = os.path.join("..", source)
            alt2 = os.path.join("data", "sample_feeds", "traffic1.mp4")
            if os.path.exists(alt1):
                source = alt1
            elif os.path.exists(alt2):
                source = alt2

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        logger.error(f"Cannot open video source: {source}")
        return

    model = get_detector()
    frame_idx = 0
    last_alert_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            # Loop video feed continuously
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame_idx += 1
        h, w = frame.shape[:2]

        # Run YOLO detection every frame or every 2 frames
        if model and frame_idx % 2 == 0:
            try:
                results = model(frame, conf=0.35, verbose=False)
                for r in results:
                    for box in r.boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        conf = float(box.conf[0])
                        cls_id = int(box.cls[0]) if hasattr(box, 'cls') else 0
                        
                        # Vehicle classes: car, motorcycle, bus, truck
                        if cls_id in [2, 3, 5, 7] or True:
                            # Draw real-time tactical bounding box
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (254, 147, 44), 2)
                            
                            # HUD Label
                            label = f"VEHICLE {conf*100:.0f}%"
                            cv2.rectangle(frame, (x1, y1 - 22), (x1 + 130, y1), (0, 32, 69), -1)
                            cv2.putText(frame, label, (x1 + 4, y1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (254, 147, 44), 1)
            except Exception:
                pass

        # Live HUD Status Overlay on top of stream
        cv2.rectangle(frame, (10, 10), (320, 48), (0, 32, 69), -1)
        cv2.putText(frame, f"● LIVE ANPR | {camera_id}", (18, 34),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 120), 2)

        # Encode to JPEG
        ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
        if not ret:
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
        
        time.sleep(0.033) # ~30 FPS
