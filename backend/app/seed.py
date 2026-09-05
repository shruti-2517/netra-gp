import json
import os
import uuid
import hashlib
import datetime
import logging
from sqlalchemy.orm import Session
from app.models import Camera, WatchlistVehicle, DetectionEvent, Alert, EvidenceCertificate, Department, Role, User
from app.services.sentinel_sync import sync_sentinel_live_catalogue
from passlib.context import CryptContext

logger = logging.getLogger("SeedData")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

    # 4. Seed Auth (Roles, Departments, Superadmin + Badge ID Officers)
    from app.security import get_password_hash

    roles_data = [
        {"name": "Superadmin"},
        {"name": "Operator"},
        {"name": "Investigator"},
        {"name": "Department Admin"},
        {"name": "Viewer"}
    ]
    for r in roles_data:
        if not db.query(Role).filter(Role.name == r["name"]).first():
            db.add(Role(name=r["name"]))
    db.commit()

    depts_data = [
        {"name": "State Police HQ", "description": "Statewide Command Headquarters"},
        {"name": "Command & Control Room", "description": "24/7 Operations & Surveillance"},
        {"name": "Crime Branch / CID", "description": "Criminal Investigation Division"},
        {"name": "Ahmedabad Traffic Zone", "description": "Urban Traffic Management"},
        {"name": "Executive Secretariat", "description": "Executive Overview & Audit"}
    ]
    for d in depts_data:
        if not db.query(Department).filter(Department.name == d["name"]).first():
            db.add(Department(name=d["name"], description=d["description"]))
    db.commit()

    users_seed_map = [
        {
            "username": "GP-1001",
            "password": "password123",
            "full_name": "Inspector V. Jadeja",
            "designation": "Senior Surveillance Officer",
            "role": "Superadmin",
            "department": "State Police HQ"
        },
        {
            "username": "GP-2002",
            "password": "password123",
            "full_name": "Operator R. Patel",
            "designation": "Control Room Operator",
            "role": "Operator",
            "department": "Command & Control Room"
        },
        {
            "username": "GP-3003",
            "password": "password123",
            "full_name": "Officer S. Mehta",
            "designation": "Investigation Officer",
            "role": "Investigator",
            "department": "Crime Branch / CID"
        },
        {
            "username": "GP-4004",
            "password": "password123",
            "full_name": "Admin K. Shah",
            "designation": "Department Administrator",
            "role": "Department Admin",
            "department": "Ahmedabad Traffic Zone"
        },
        {
            "username": "GP-5005",
            "password": "password123",
            "full_name": "Viewer M. Desai",
            "designation": "Executive Viewer",
            "role": "Viewer",
            "department": "Executive Secretariat"
        },
        {
            "username": "admin",
            "password": "admin123",
            "full_name": "System Administrator",
            "designation": "State Police HQ Admin",
            "role": "Superadmin",
            "department": "State Police HQ"
        }
    ]

    for u_info in users_seed_map:
        existing = db.query(User).filter(User.username == u_info["username"]).first()
        if not existing:
            role_obj = db.query(Role).filter(Role.name == u_info["role"]).first()
            dept_obj = db.query(Department).filter(Department.name == u_info["department"]).first()
            if role_obj and dept_obj:
                user_obj = User(
                    username=u_info["username"],
                    hashed_password=get_password_hash(u_info["password"]),
                    full_name=u_info["full_name"],
                    designation=u_info["designation"],
                    role_id=role_obj.id,
                    department_id=dept_obj.id,
                    is_active=True
                )
                db.add(user_obj)
    db.commit()
    logger.info("Seeded initial Auth roles, departments, Superadmin, and Officer Badge accounts into DB.")
