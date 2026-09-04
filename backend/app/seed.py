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

    # 3. Detection Events, Alerts, & BSA 2023 Evidence Certificates are generated directly from live video feed evaluations.
    logger.info("Database seeding completed. Live feed evaluation ready.")

