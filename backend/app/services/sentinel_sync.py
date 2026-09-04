"""
NETRA-GP Automated Sentinel Grid Synchronizer
Fetches the live camera catalogue (cameras.json),
upserts all 30 live camera nodes into PostgreSQL database & sample_cameras.json,
and detects any additions, renames, or modifications dynamically.
"""
import os
import json
import logging
import requests
from sqlalchemy.orm import Session
from app.models import Camera
from app.config import settings

logger = logging.getLogger("SentinelSync")

SENTINEL_EMAIL = settings.SENTINEL_EMAIL
SENTINEL_PASS = settings.SENTINEL_PASS
SENTINEL_HOST = settings.SENTINEL_HOST

CITY_MAP = {
    "cam01": ("Ahmedabad", "Police / Traffic", 23.0645, 72.5810),
    "cam02": ("Ahmedabad", "Municipal Corporation", 23.0305, 72.5650),
    "cam03": ("Ahmedabad", "Police / Traffic", 23.0920, 72.5930),
    "cam04": ("Ahmedabad", "Police / Traffic", 23.0124, 72.5625),
    "cam05": ("Ahmedabad", "RTO Checkpost", 23.1020, 72.5910),
    "cam06": ("Junagadh", "Police / Traffic", 21.5120, 70.4680),
    "cam07": ("Gir Somnath", "Home Department", 20.9020, 70.3710),
    "cam08": ("Junagadh", "Municipal Corporation", 21.5280, 70.4590),
    "cam09": ("Junagadh", "RTO Checkpost", 21.5410, 70.4720),
    "cam10": ("Junagadh", "Smart City VMS", 21.5190, 70.4610),
    "cam11": ("Junagadh", "Police / Traffic", 21.5510, 70.4690),
    "cam12": ("Gandhinagar", "RTO Checkpost", 23.1680, 72.5810),
    "cam13": ("Ahmedabad", "Municipal Corporation", 23.0280, 72.5480),
    "cam14": ("Ahmedabad", "Police / Traffic", 23.0380, 72.5520),
    "cam15": ("Ahmedabad", "Smart City VMS", 23.0190, 72.5390),
    "cam16": ("Ahmedabad", "Police / Traffic", 23.1040, 72.5925),
    "cam17": ("Rajkot", "Transport Dept", 22.3010, 70.8010),
    "cam18": ("Rajkot", "Police / Traffic", 22.3050, 70.7980),
    "cam19": ("Navsari", "Home Department", 20.8410, 72.9810),
    "cam20": ("Gandhinagar", "Smart City VMS", 23.2380, 72.6450),
    "cam21": ("Patan", "RTO Checkpost", 23.8510, 72.1280),
    "cam22": ("Banaskantha", "Police / Traffic", 24.1720, 72.4380),
    "cam23": ("Gujarat Corridor", "Home Department", 22.4510, 71.8210),
    "cam24": ("Gandhinagar", "Municipal Corporation", 23.1680, 72.8120),
    "cam25": ("Navsari", "RTO Checkpost", 20.8910, 72.9510),
    "cam26": ("Navsari", "Police / Traffic", 20.7810, 73.0120),
    "cam27": ("Navsari", "Municipal Corporation", 20.7610, 72.9680),
    "cam28": ("Navsari", "Smart City VMS", 20.7640, 72.9710),
    "cam29": ("Navsari", "Police / Traffic", 20.7680, 72.9750),
    "cam30": ("Kutch", "Police / Traffic", 23.0780, 70.1340),
}

def sync_sentinel_live_catalogue(db: Session):
    """
    Connects to Sentinel live control room portal, fetches the official camera set,
    and updates PostgreSQL database & sample_cameras.json with exact names & URLs.
    """
    session = requests.Session()
    login_url = f"{SENTINEL_HOST}/auth/login"

    try:
        res = session.post(
            login_url,
            data={"email": SENTINEL_EMAIL, "password": SENTINEL_PASS},
            headers={"User-Agent": "NETRA-GP-IngestGateway/1.0"},
            timeout=12.0
        )
        if res.status_code != 200:
            logger.warning(f"Sentinel portal login returned status {res.status_code}")
            return False

        cam_res = session.get(f"{SENTINEL_HOST}/cameras.json", timeout=12.0)
        if cam_res.status_code != 200:
            logger.warning(f"Sentinel cameras.json returned status {cam_res.status_code}")
            return False

        raw_cams = cam_res.json()
        logger.info(f"Retrieved {len(raw_cams)} live cameras from Sentinel Control Room portal.")

        sample_list = []

        for item in raw_cams:
            cid = item.get("id")
            name = item.get("name")
            city, dept, lat, lng = CITY_MAP.get(cid, ("Gujarat Sector", "Police / Traffic", 23.0, 72.5))
            stream_url = f"{SENTINEL_HOST}/{cid}/index.m3u8"

            sample_list.append({
                "camera_id": cid,
                "name": name,
                "department": dept,
                "city": city,
                "latitude": lat,
                "longitude": lng,
                "stream_url": stream_url,
                "type": "Sentinel Live Camera",
                "status": "ACTIVE"
            })

            # Upsert into PostgreSQL DB
            existing = db.query(Camera).filter(Camera.camera_id == cid).first()
            if existing:
                existing.name = name
                existing.department = dept
                existing.city = city
                existing.latitude = lat
                existing.longitude = lng
                existing.stream_url = stream_url
            else:
                new_cam = Camera(
                    camera_id=cid,
                    name=name,
                    department=dept,
                    city=city,
                    latitude=lat,
                    longitude=lng,
                    stream_url=stream_url,
                    type="Sentinel Live Camera",
                    status="ACTIVE"
                )
                db.add(new_cam)

        db.commit()

        # Update local sentinel_live_cameras.json file
        json_path = os.path.join("..", "data", "sentinel_live_cameras.json")
        if not os.path.exists(json_path):
            json_path = os.path.join("data", "sentinel_live_cameras.json")
        if os.path.exists(os.path.dirname(json_path)):
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(sample_list, f, indent=2)

        logger.info("Sentinel live camera catalogue successfully synchronized into DB & JSON!")
        return True

    except Exception as e:
        logger.error(f"Error during Sentinel live sync: {e}")
        return False
