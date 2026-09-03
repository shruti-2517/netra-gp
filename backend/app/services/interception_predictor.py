import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import DetectionEvent, Camera
from app.services.speed_calculator import haversine_distance_km

class InterceptionPredictor:
    @staticmethod
    def predict_next_checkpoints(
        db: Session,
        license_plate: str,
        limit_candidates: int = 3
    ) -> Dict[str, Any]:
        """
        Analyzes historical waypoint trajectory of a vehicle, computes direction vector / heading,
        and identifies downstream cameras most likely to encounter the vehicle next.
        """
        clean_plate = license_plate.replace("-", "").replace(" ", "").upper()
        
        # Fetch chronological detections
        detections = db.query(DetectionEvent).filter(
            DetectionEvent.license_plate.ilike(f"%{clean_plate}%")
        ).order_by(DetectionEvent.id.asc()).all()

        if not detections:
            return {
                "license_plate": license_plate.upper(),
                "trajectory_available": False,
                "predicted_checkpoints": [],
                "confidence_score": 0.0,
                "status": "NO_HISTORICAL_DETECTIONS"
            }

        # Get unique cameras along the journey
        visited_cam_ids = [d.camera_id for d in detections]
        last_cam_id = visited_cam_ids[-1]
        last_cam = db.query(Camera).filter(Camera.camera_id == last_cam_id).first()

        if not last_cam:
            return {
                "license_plate": license_plate.upper(),
                "trajectory_available": False,
                "predicted_checkpoints": [],
                "confidence_score": 0.0,
                "status": "LAST_CAMERA_UNKNOWN"
            }

        # Compute heading vector if >= 2 detections
        heading_degrees = 0.0
        if len(visited_cam_ids) >= 2:
            prev_cam_id = visited_cam_ids[-2]
            prev_cam = db.query(Camera).filter(Camera.camera_id == prev_cam_id).first()
            if prev_cam:
                d_lat = last_cam.latitude - prev_cam.latitude
                d_lon = last_cam.longitude - prev_cam.longitude
                heading_rad = math.atan2(d_lon, d_lat)
                heading_degrees = (math.degrees(heading_rad) + 360) % 360

        # Query all other candidate cameras
        all_cams = db.query(Camera).filter(
            Camera.camera_id != last_cam_id,
            Camera.status == "ACTIVE"
        ).all()

        candidates = []
        for cam in all_cams:
            dist_km = haversine_distance_km(last_cam.latitude, last_cam.longitude, cam.latitude, cam.longitude)
            
            # Vector angle from last_cam to candidate cam
            c_dlat = cam.latitude - last_cam.latitude
            c_dlon = cam.longitude - last_cam.longitude
            c_heading = (math.degrees(math.atan2(c_dlon, c_dlat)) + 360) % 360

            # Angle difference from vehicle movement vector
            angle_diff = abs(heading_degrees - c_heading)
            if angle_diff > 180:
                angle_diff = 360 - angle_diff

            # Probability score inversely proportional to distance and directional alignment
            direction_alignment = max(0.1, math.cos(math.radians(angle_diff)))
            # Assuming 60 km/h average transit
            eta_minutes = max(2, int((dist_km / 60.0) * 60))

            probability_score = round(max(0.15, min(0.95, (direction_alignment * 0.7) + (1.0 / (1.0 + dist_km * 0.05)) * 0.3)), 2)

            candidates.append({
                "camera_id": cam.camera_id,
                "camera_name": cam.name,
                "city": cam.city,
                "department": cam.department,
                "latitude": cam.latitude,
                "longitude": cam.longitude,
                "distance_km": round(dist_km, 2),
                "eta_minutes": eta_minutes,
                "probability_score": probability_score,
                "recommended_action": "DISPATCH_PATROL_INTERCEPT" if probability_score > 0.6 else "MONITOR_CHECKPOINT"
            })

        # Sort by highest probability
        candidates.sort(key=lambda x: x["probability_score"], reverse=True)
        top_candidates = candidates[:limit_candidates]

        return {
            "license_plate": license_plate.upper(),
            "trajectory_available": True,
            "last_known_camera": {
                "camera_id": last_cam.camera_id,
                "name": last_cam.name,
                "city": last_cam.city,
                "latitude": last_cam.latitude,
                "longitude": last_cam.longitude
            },
            "heading_degrees": round(heading_degrees, 1),
            "predicted_checkpoints": top_candidates,
            "confidence_score": top_candidates[0]["probability_score"] if top_candidates else 0.0,
            "status": "INTERCEPTION_PATH_COMPUTED"
        }
