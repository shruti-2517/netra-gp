import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    department = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    stream_url = Column(String(500), nullable=False)
    type = Column(String(100), default="Fixed IP Camera")
    status = Column(String(50), default="ACTIVE")

class WatchlistVehicle(Base):
    __tablename__ = "watchlist_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(String(50), unique=True, index=True, nullable=False)
    license_plate = Column(String(50), index=True, nullable=False)
    vehicle_make = Column(String(100))
    color = Column(String(50))
    reason = Column(Text)
    category = Column(String(50), default="STOLEN")  # STOLEN, CRIMINAL_WANTED, TRAFFIC_VIOLATION
    threat_level = Column(String(50), default="HIGH")  # CRITICAL, HIGH, MEDIUM, WARNING
    owner_name = Column(String(100))
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

class DetectionEvent(Base):
    __tablename__ = "detection_events"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(String(100), nullable=False)
    license_plate = Column(String(50), index=True, nullable=False)
    raw_ocr_text = Column(String(100))
    detection_confidence = Column(Float, default=0.0)
    ocr_confidence = Column(Float, default=0.0)
    bbox = Column(String(100))  # stored as comma-separated string e.g. "100,200,300,400"
    is_watchlist_hit = Column(Boolean, default=False)
    threat_level = Column(String(50), nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True, nullable=False)
    camera_id = Column(String(50), index=True, nullable=False)
    camera_name = Column(String(200))
    city = Column(String(100))
    license_plate = Column(String(50), index=True, nullable=False)
    vehicle_info = Column(String(200))
    reason = Column(Text)
    threat_level = Column(String(50), nullable=False)  # CRITICAL, HIGH, MEDIUM, WARNING
    category = Column(String(50))
    timestamp = Column(String(100), nullable=False)
    is_read = Column(Boolean, default=False)
