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
            for candidate in ["cv_engine/yolov8n.pt", "yolov8n.pt"]:
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

        if self.use_yolo and self.model:
            results = self.model(frame, conf=CVConfig.DETECTION_CONFIDENCE_THRESHOLD, verbose=False)
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0]) if hasattr(box, 'cls') else 0
                    
                    # Ignore top 10% and bottom 8% screen margins (watermark & timestamp zone)
                    if y1 < 0.10 * h or y2 > 0.92 * h:
                        continue

                    # If YOLO detects a vehicle (class 2: car, 3: motorcycle, 5: bus, 7: truck), extract plate region from lower half of vehicle
                    if cls_id in [2, 3, 5, 7]:
                        vh = y2 - y1
                        # Plate is typically located in lower 50% of the vehicle body
                        plate_crop = frame[y1 + int(vh * 0.5):y2, x1:x2]
                        if plate_crop.size > 0:
                            detections.append({
                                'bbox': (x1, y1 + int(vh * 0.5), x2, y2),
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
        else:
            # Fallback contour locator with margin filtering
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            edged = cv2.Canny(blur, 50, 150)

            contours, _ = cv2.findContours(edged, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

            for cnt in contours:
                x, y, cw, ch = cv2.boundingRect(cnt)
                aspect_ratio = cw / float(ch) if ch > 0 else 0
                area = cw * ch
                
                # Ignore outer 5% screen margin (watermarks)
                if y < 0.05 * h or (y + ch) > 0.95 * h:
                    continue

                if 1.5 <= aspect_ratio <= 6.5 and 400 <= area <= 100000 and cw < w * 0.6:
                    crop = frame[y:y+ch, x:x+cw]
                    detections.append({
                        'bbox': (x, y, x + cw, y + ch),
                        'confidence': 0.75,
                        'crop': crop
                    })

        return detections
