import json
import os
import logging
from sqlalchemy.orm import Session
from app.models import Camera, WatchlistVehicle

logger = logging.getLogger("SeedData")

def seed_initial_data(db: Session):
    """
    Populates database with sample cameras and watchlist vehicles if tables are empty
    """
    # 1. Seed Cameras
    if db.query(Camera).count() == 0:
        cameras_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample_cameras.json")
        if os.path.exists(cameras_file):
            try:
                with open(cameras_file, "r") as f:
                    cameras_data = json.load(f)
                for cam in cameras_data:
                    camera_obj = Camera(
                        camera_id=cam.get("camera_id"),
                        name=cam.get("name"),
                        department=cam.get("department"),
                        city=cam.get("city"),
                        latitude=cam.get("latitude"),
                        longitude=cam.get("longitude"),
                        stream_url=cam.get("stream_url"),
                        type=cam.get("type", "Fixed IP Camera"),
                        status=cam.get("status", "ACTIVE")
                    )
                    db.add(camera_obj)
                db.commit()
                logger.info(f"Seeded {len(cameras_data)} cameras from sample_cameras.json")
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
