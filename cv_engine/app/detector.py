import os
import cv2
import numpy as np
import logging
from app.config import CVConfig

logger = logging.getLogger("LicensePlateDetector")

class LicensePlateDetector:
    def __init__(self, model_path=None):
        self.model = None
        self.use_yolo = False
        
        # Auto-discover local YOLO weights if model_path is not explicitly passed
        if not model_path:
            for candidate in ["cv_engine/yolov8n.pt", "yolov8n.pt", "../cv_engine/yolov8n.pt"]:
                if os.path.exists(candidate):
                    model_path = candidate
                    break

        if model_path:
            try:
                from ultralytics import YOLO
                self.model = YOLO(model_path)
                self.use_yolo = True
                logger.info(f"YOLOv8 Plate Detector loaded from {model_path}")
            except Exception as e:
                logger.warning(f"Could not load YOLO model ({e}). Falling back to heuristic plate locator.")

    def detect_plates(self, frame):
        """
        Input: BGR OpenCV frame
        Output: List of dicts with bounding boxes and cropped plate images
        """
        detections = []
        h, w = frame.shape[:2]

        # 1. YOLO-Based Object & Vehicle Extraction
        if self.use_yolo and self.model:
            try:
                results = self.model(frame, conf=0.25, verbose=False)
                for r in results:
                    for box in r.boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        conf = float(box.conf[0])
                        cls_id = int(box.cls[0]) if hasattr(box, 'cls') else 0
                        
                        # Vehicle classes (car, motorcycle, bus, truck)
                        if cls_id in [2, 3, 5, 7]:
                            vh = y2 - y1
                            # Plate in lower 60% of vehicle
                            p_y1 = max(0, y1 + int(vh * 0.40))
                            plate_crop = frame[p_y1:y2, x1:x2]
                            if plate_crop.size > 0:
                                detections.append({
                                    'bbox': (x1, p_y1, x2, y2),
                                    'confidence': conf,
                                    'crop': plate_crop
                                })
                        else:
                            crop = frame[y1:y2, x1:x2]
                            if crop.size > 0:
                                detections.append({
                                    'bbox': (x1, y1, x2, y2),
                                    'confidence': conf,
                                    'crop': crop
                                })
            except Exception as e:
                logger.warning(f"YOLO inference error: {e}")

        # 2. Geometric Rectangular Plate Locator (Crucial for handheld plates & zoomed crops)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        edged = cv2.Canny(blur, 50, 200)

        contours, _ = cv2.findContours(edged, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            x, y, cw, ch = cv2.boundingRect(cnt)
            aspect_ratio = cw / float(ch) if ch > 0 else 0
            area = cw * ch
            
            # Typical Indian HSRP plates have aspect ratio between 1.8 and 6.0
            if 1.8 <= aspect_ratio <= 6.0 and 800 <= area <= (w * h * 0.5):
                crop = frame[y:y+ch, x:x+cw]
                if crop.size > 0:
                    detections.append({
                        'bbox': (x, y, x + cw, y + ch),
                        'confidence': 0.85,
                        'crop': crop
                    })

        # 3. Always include Center ROI (where users hold objects in webcams)
        cx1 = int(w * 0.15)
        cy1 = int(h * 0.20)
        cx2 = int(w * 0.85)
        cy2 = int(h * 0.80)
        center_crop = frame[cy1:cy2, cx1:cx2]
        if center_crop.size > 0:
            detections.append({
                'bbox': (cx1, cy1, cx2, cy2),
                'confidence': 0.90,
                'crop': center_crop
            })

        return detections
