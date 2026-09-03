import cv2
import numpy as np
import logging

logger = logging.getLogger("VMMCClassifier")

class VMMCClassifier:
    """
    Vehicle Make, Model, Color (VMMC) & Re-Identification Classifier.
    Extracts dominant vehicle body color using HSV clustering and classifies body type.
    """

    COLOR_RANGES = [
        ("RED", [(0, 70, 50), (10, 255, 255)], [(170, 70, 50), (180, 255, 255)]),
        ("BLUE", [(100, 70, 50), (130, 255, 255)], None),
        ("GREEN", [(35, 70, 50), (85, 255, 255)], None),
        ("YELLOW", [(20, 70, 50), (35, 255, 255)], None),
        ("WHITE", [(0, 0, 180), (180, 40, 255)], None),
        ("BLACK", [(0, 0, 0), (180, 255, 50)], None),
        ("SILVER/GREY", [(0, 0, 50), (180, 40, 180)], None),
    ]

    @classmethod
    def classify_vehicle_color(cls, vehicle_crop: np.ndarray) -> str:
        """
        Extracts dominant color from upper body region of the vehicle crop.
        """
        if vehicle_crop is None or vehicle_crop.size == 0:
            return "UNKNOWN"

        h, w = vehicle_crop.shape[:2]
        # Crop to upper-middle body (ignore road asphalt and windshield)
        roi = vehicle_crop[int(h * 0.15):int(h * 0.65), int(w * 0.15):int(w * 0.85)]
        if roi.size == 0:
            roi = vehicle_crop

        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        total_pixels = roi.shape[0] * roi.shape[1]
        if total_pixels == 0:
            return "UNKNOWN"

        color_scores = {}
        for color_name, range1, range2 in cls.COLOR_RANGES:
            lower1, upper1 = np.array(range1[0]), np.array(range1[1])
            mask = cv2.inRange(hsv, lower1, upper1)
            if range2:
                lower2, upper2 = np.array(range2[0]), np.array(range2[1])
                mask2 = cv2.inRange(hsv, lower2, upper2)
                mask = cv2.bitwise_or(mask, mask2)
            
            score = cv2.countNonZero(mask) / float(total_pixels)
            color_scores[color_name] = score

        best_color = max(color_scores, key=color_scores.get)
        return best_color if color_scores[best_color] > 0.12 else "WHITE/SILVER"

    @staticmethod
    def classify_vehicle_type(bbox: tuple, frame_shape: tuple, yolo_class_name: str = None) -> str:
        """
        Classifies vehicle type based on aspect ratio, size relative to frame, and class label.
        """
        if yolo_class_name:
            label = yolo_class_name.upper()
            if "CAR" in label or "SEDAN" in label:
                return "SEDAN"
            if "BUS" in label:
                return "BUS"
            if "TRUCK" in label:
                return "HEAVY_TRUCK"
            if "MOTORCYCLE" in label or "BIKE" in label:
                return "TWO_WHEELER"

        if not bbox:
            return "VEHICLE"

        x1, y1, x2, y2 = bbox
        bw = x2 - x1
        bh = y2 - y1
        aspect_ratio = bw / float(bh) if bh > 0 else 1.0

        if aspect_ratio > 2.0:
            return "BUS" if bh > 180 else "SEDAN"
        elif 1.3 <= aspect_ratio <= 2.0:
            return "SUV" if bh > 140 else "HATCHBACK"
        elif aspect_ratio < 1.0:
            return "TWO_WHEELER"
        return "SEDAN"
