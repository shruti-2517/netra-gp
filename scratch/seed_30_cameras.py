import json
import sys
import os

sys.path.insert(0, os.path.abspath("backend"))

from app.database import SessionLocal, engine, Base
from app.models import Camera

Base.metadata.create_all(bind=engine)
db = SessionLocal()

with open("data/sample_cameras.json", "r", encoding="utf-8") as f:
    cameras_data = json.load(f)

# Clear existing cameras and insert 30 live Sentinel cameras
db.query(Camera).delete()
db.commit()

for cam in cameras_data:
    camera_obj = Camera(
        camera_id=cam.get("camera_id"),
        name=cam.get("name"),
        department=cam.get("department"),
        city=cam.get("city"),
        latitude=cam.get("latitude"),
        longitude=cam.get("longitude"),
        stream_url=cam.get("stream_url"),
        type=cam.get("type", "Sentinel Live Camera"),
        status=cam.get("status", "ACTIVE")
    )
    db.add(camera_obj)

db.commit()

total = db.query(Camera).count()
print(f"[SUCCESS] Re-seeded database with all {total} live Sentinel CCTV cameras (cam01 to cam30).")
db.close()
