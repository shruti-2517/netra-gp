import math
from datetime import datetime
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models import DetectionEvent, Camera

DEFAULT_SPEED_LIMIT_KMH = 80.0 # Standard urban / arterial road limit in Gujarat

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates great-circle distance between two GPS coordinates using Haversine formula.
    Returns distance in kilometers.
    """
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class SpeedCalculator:
    @staticmethod
    def calculate_inter_camera_speed(
        db: Session,
        license_plate: str,
        current_camera_id: str,
        current_timestamp_str: str,
        speed_limit_kmh: float = DEFAULT_SPEED_LIMIT_KMH
    ) -> Tuple[Optional[float], bool, Optional[str]]:
        """
        Calculates average transit speed (v = delta_d / delta_t) between the current camera
        and the last detected camera for this vehicle.
        
        Returns:
            (speed_kmh, is_violation, details_message)
        """
        clean_plate = license_plate.replace("-", "").replace(" ", "").upper()
        
        # Find the most recent prior detection for this vehicle across different cameras
        prev_detection = db.query(DetectionEvent).filter(
            DetectionEvent.license_plate.ilike(f"%{clean_plate}%"),
            DetectionEvent.camera_id != current_camera_id
        ).order_by(DetectionEvent.id.desc()).first()

        if not prev_detection:
            return None, False, None

        current_cam = db.query(Camera).filter(Camera.camera_id == current_camera_id).first()
        prev_cam = db.query(Camera).filter(Camera.camera_id == prev_detection.camera_id).first()

        if not current_cam or not prev_cam:
            return None, False, None

        # Distance between cameras in km
        distance_km = haversine_distance_km(
            prev_cam.latitude, prev_cam.longitude,
            current_cam.latitude, current_cam.longitude
        )

        # Parse timestamps (ISO format or PTS)
        try:
            t_curr = datetime.fromisoformat(current_timestamp_str.replace("Z", "+00:00"))
            t_prev = datetime.fromisoformat(prev_detection.timestamp.replace("Z", "+00:00"))
            elapsed_seconds = abs((t_curr - t_prev).total_seconds())
        except Exception:
            return None, False, None # Invalid timestamp format; do not guess

        if elapsed_seconds <= 0.5:
            return None, False, None # Too close or instantaneous duplicate frame

        # Speed in km/h = (distance in km) / (hours elapsed)
        elapsed_hours = elapsed_seconds / 3600.0
        calculated_speed = round(distance_km / elapsed_hours, 1)

        # Glitch filter: Ignore non-physical speeds (> 250 km/h or < 2 km/h)
        if calculated_speed > 250.0 or calculated_speed < 2.0:
            return None, False, None

        # Enforce 5% speedometer tolerance buffer before flagging violation
        enforced_threshold = round(speed_limit_kmh * 1.05, 1)
        is_violation = calculated_speed > enforced_threshold

        details = (
            f"Average Speed: {calculated_speed} km/h (Enforced Threshold: {enforced_threshold} km/h, Limit: {speed_limit_kmh} km/h) "
            f"over {distance_km:.2f} km between [{prev_cam.name}] and [{current_cam.name}]."
        )

        return calculated_speed, is_violation, details
