import json
import os
import uuid
import hashlib
import datetime
import logging
from sqlalchemy.orm import Session
from app.models import Camera, WatchlistVehicle, DetectionEvent, Alert, EvidenceCertificate
from app.services.sentinel_sync import sync_sentinel_live_catalogue

logger = logging.getLogger("SeedData")

def seed_initial_data(db: Session):
    """
    Populates database with sample cameras, watchlist vehicles, detection events,
    BSA 2023 evidence certificates, and alerts if tables are empty,
    and dynamically synchronizes live Sentinel camera names and URLs from cctv.corp8.cloud.
    """
    # 1. Fetch live camera catalogue from Sentinel Portal (cctv.corp8.cloud)
    synced = sync_sentinel_live_catalogue(db)
    
    # Fallback seeding if offline or unauthenticated
    if not synced and db.query(Camera).count() < 30:
        cameras_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sentinel_live_cameras.json")
        if os.path.exists(cameras_file):
            try:
                with open(cameras_file, "r") as f:
                    cameras_data = json.load(f)
                for cam in cameras_data:
                    cid = cam.get("camera_id") or cam.get("id")
                    existing = db.query(Camera).filter(Camera.camera_id == cid).first()
                    if not existing:
                        camera_obj = Camera(
                            camera_id=cid,
                            name=cam.get("name"),
                            department=cam.get("department", "Police / Traffic"),
                            city=cam.get("city", "Gujarat"),
                            latitude=cam.get("latitude", 23.0),
                            longitude=cam.get("longitude", 72.5),
                            stream_url=cam.get("stream_url", f"https://cctv.corp8.cloud/{cid}/index.m3u8"),
                            type=cam.get("type", "Sentinel Live Camera"),
                            status=cam.get("status", "ACTIVE")
                        )
                        db.add(camera_obj)
                db.commit()
                logger.info(f"Seeded 30 live Sentinel cameras from sentinel_live_cameras.json")
            except Exception as e:
                logger.error(f"Error seeding cameras: {e}")
                db.rollback()

    # 2. Seed Watchlist Vehicles
    if db.query(WatchlistVehicle).count() == 0:
        watchlist_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample_watchlist.json")
        if os.path.exists(watchlist_file):
            try:
                with open(watchlist_file, "r") as f:
                    watchlist_data = json.load(f)
                for item in watchlist_data:
                    vehicle_obj = WatchlistVehicle(
                        watchlist_id=item.get("watchlist_id"),
                        license_plate=item.get("license_plate"),
                        vehicle_make=item.get("vehicle_make"),
                        color=item.get("color"),
                        reason=item.get("reason"),
                        category=item.get("category", "STOLEN"),
                        threat_level=item.get("threat_level", "HIGH"),
                        owner_name=item.get("owner_name")
                    )
                    db.add(vehicle_obj)
                db.commit()
                logger.info(f"Seeded {len(watchlist_data)} watchlist vehicles from sample_watchlist.json")
            except Exception as e:
                logger.error(f"Error seeding watchlist: {e}")
                db.rollback()

    # 3. Seed Initial Detection Events, Route Telemetry, Alerts, & BSA 2023 Evidence Certificates
    if db.query(DetectionEvent).count() == 0:
        try:
            now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
            
            sample_detections = [
                {
                    "camera_id": "cam01",
                    "timestamp": "2026-09-04T08:15:00Z",
                    "license_plate": "GJ01AB1234",
                    "raw_ocr_text": "GJ 01 AB 1234",
                    "detection_confidence": 0.94,
                    "ocr_confidence": 0.92,
                    "vehicle_color": "WHITE",
                    "vehicle_type": "SEDAN",
                    "speed_kmh": 72.0,
                    "is_speed_violation": False,
                    "is_watchlist_hit": False,
                    "threat_level": "NONE"
                },
                {
                    "camera_id": "cam12",
                    "timestamp": "2026-09-04T09:45:00Z",
                    "license_plate": "GJ01AB1234",
                    "raw_ocr_text": "GJ01AB1234",
                    "detection_confidence": 0.91,
                    "ocr_confidence": 0.89,
                    "vehicle_color": "WHITE",
                    "vehicle_type": "SEDAN",
                    "speed_kmh": 94.5,
                    "is_speed_violation": True,
                    "is_watchlist_hit": False,
                    "threat_level": "WARNING"
                },
                {
                    "camera_id": "cam17",
                    "timestamp": "2026-09-04T11:30:00Z",
                    "license_plate": "GJ01AB1234",
                    "raw_ocr_text": "GJ01AB1234",
                    "detection_confidence": 0.96,
                    "ocr_confidence": 0.95,
                    "vehicle_color": "WHITE",
                    "vehicle_type": "SEDAN",
                    "speed_kmh": 112.4,
                    "is_speed_violation": True,
                    "is_watchlist_hit": True,
                    "threat_level": "HIGH"
                },
                {
                    "camera_id": "cam06",
                    "timestamp": "2026-09-04T10:10:00Z",
                    "license_plate": "GJ18CD5678",
                    "raw_ocr_text": "GJ 18 CD 5678",
                    "detection_confidence": 0.93,
                    "ocr_confidence": 0.90,
                    "vehicle_color": "BLACK",
                    "vehicle_type": "SUV",
                    "speed_kmh": 74.2,
                    "is_speed_violation": False,
                    "is_watchlist_hit": True,
                    "threat_level": "CRITICAL"
                }
            ]

            for det in sample_detections:
                payload = f"{det['license_plate']}|{det['camera_id']}|{det['timestamp']}|{det['speed_kmh']}|{det['threat_level']}"
                e_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
                
                event = DetectionEvent(
                    camera_id=det["camera_id"],
                    timestamp=det["timestamp"],
                    license_plate=det["license_plate"],
                    raw_ocr_text=det["raw_ocr_text"],
                    detection_confidence=det["detection_confidence"],
                    ocr_confidence=det["ocr_confidence"],
                    vehicle_color=det["vehicle_color"],
                    vehicle_type=det["vehicle_type"],
                    speed_kmh=det["speed_kmh"],
                    is_speed_violation=det["is_speed_violation"],
                    evidence_hash=e_hash,
                    is_watchlist_hit=det["is_watchlist_hit"],
                    threat_level=det["threat_level"]
                )
                db.add(event)
                db.commit()
                db.refresh(event)

                # Seed Evidence Certificate if speed violation or hit
                if det["is_speed_violation"] or det["is_watchlist_hit"]:
                    cert_id = f"CERT-BSA-2023-{uuid.uuid4().hex[:10].upper()}"
                    v_type = "INTER_CAMERA_SPEED_VIOLATION" if det["is_speed_violation"] else f"WATCHLIST_{det['threat_level']}"
                    fine = 2000 if det["is_speed_violation"] else 5000
                    
                    cert = EvidenceCertificate(
                        certificate_id=cert_id,
                        detection_id=event.id,
                        license_plate=det["license_plate"],
                        camera_id=det["camera_id"],
                        violation_type=v_type,
                        speed_recorded_kmh=det["speed_kmh"],
                        speed_limit_kmh=80.0,
                        fine_amount_inr=fine,
                        sha256_hash=e_hash,
                        digital_signature=f"DIGISIGN//GUJ_POLICE_ANPR//{e_hash[:32]}",
                        bsa_admissibility_code="BSA-2023-SEC63-CERTIFIED",
                        status="ISSUED"
                    )
                    db.add(cert)

                    # Seed Alert record
                    cam_obj = db.query(Camera).filter(Camera.camera_id == det["camera_id"]).first()
                    city = cam_obj.city if cam_obj else "Gujarat"
                    reason = f"Overspeeding Violation: Recorded {det['speed_kmh']} km/h (Limit: 80 km/h)" if det["is_speed_violation"] else f"Watchlist Threat Alert ({det['threat_level']})"

                    alert = Alert(
                        alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                        detection_id=event.id,
                        license_plate=det["license_plate"],
                        threat_level=det["threat_level"],
                        reason=reason,
                        camera_id=det["camera_id"],
                        city=city,
                        timestamp=det["timestamp"],
                        is_read=False
                    )
                    db.add(alert)
                    db.commit()

            logger.info("Seeded initial detection events, BSA 2023 certificates, and alerts!")
        except Exception as e:
            logger.error(f"Error seeding detection events & certificates: {e}")
            db.rollback()

