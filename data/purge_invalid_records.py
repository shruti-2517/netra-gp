import os
import sys
import re
import datetime

root_dir = os.path.abspath(".")
sys.path.insert(0, root_dir)
sys.path.insert(0, os.path.join(root_dir, "backend"))

from app.database import SessionLocal
from app.models import DetectionEvent, Alert, EvidenceCertificate
from cv_engine.app.config import is_valid_indian_plate

db = SessionLocal()

TODAY_STR = datetime.datetime.utcnow().strftime("%Y-%m-%d")

print(f"Purging Database Records (Target Date: TODAY ONLY = {TODAY_STR})...")

# 1. Purge Detection Events
all_dets = db.query(DetectionEvent).all()
deleted_dets = 0
for d in all_dets:
    is_valid_syntax = is_valid_indian_plate(d.license_plate)
    is_today = d.timestamp and d.timestamp.startswith(TODAY_STR)
    if not (is_valid_syntax and is_today):
        db.delete(d)
        deleted_dets += 1

# 2. Purge Alerts
all_alts = db.query(Alert).all()
deleted_alts = 0
for a in all_alts:
    is_valid_syntax = is_valid_indian_plate(a.license_plate)
    is_today = a.timestamp and a.timestamp.startswith(TODAY_STR)
    if not (is_valid_syntax and is_today):
        db.delete(a)
        deleted_alts += 1

# 3. Purge Evidence Certificates
all_certs = db.query(EvidenceCertificate).all()
deleted_certs = 0
for c in all_certs:
    is_valid_syntax = is_valid_indian_plate(c.license_plate)
    is_today = c.issued_at and c.issued_at.strftime("%Y-%m-%d") == TODAY_STR
    if not (is_valid_syntax and is_today):
        db.delete(c)
        deleted_certs += 1

db.commit()

print(f"Purge Complete!")
print(f"  - Deleted Detection Events: {deleted_dets}")
print(f"  - Deleted Alerts:           {deleted_alts}")
print(f"  - Deleted Certificates:     {deleted_certs}")

db.close()
