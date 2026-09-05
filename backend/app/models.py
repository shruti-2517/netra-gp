import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
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
    
    # Phase 2: VMMC & Enforcement Fields
    vehicle_color = Column(String(50), default="UNKNOWN")
    vehicle_type = Column(String(50), default="VEHICLE")  # SEDAN, SUV, BUS, TRUCK, MOTORCYCLE
    speed_kmh = Column(Float, nullable=True)
    is_speed_violation = Column(Boolean, default=False)
    evidence_hash = Column(String(64), nullable=True)  # SHA-256 tamper-evident digital seal

    is_watchlist_hit = Column(Boolean, default=False)
    threat_level = Column(String(50), nullable=True)

class EvidenceCertificate(Base):
    __tablename__ = "evidence_certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String(60), unique=True, index=True, nullable=False)
    detection_id = Column(Integer, index=True, nullable=False)
    license_plate = Column(String(50), index=True, nullable=False)
    camera_id = Column(String(50), nullable=False)
    violation_type = Column(String(100), nullable=False) # SPEED_VIOLATION, WATCHLIST_STOLEN, SUSPICIOUS_MOVEMENT
    speed_recorded_kmh = Column(Float, nullable=True)
    speed_limit_kmh = Column(Float, default=80.0)
    fine_amount_inr = Column(Integer, default=1000)
    sha256_hash = Column(String(64), nullable=False)
    digital_signature = Column(Text, nullable=False)
    bsa_admissibility_code = Column(String(50), default="BSA-2023-SEC63")
    issued_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="ISSUED")

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

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255))
    
    users = relationship("User", back_populates="department")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    
    department = relationship("Department", back_populates="users")
    role = relationship("Role", back_populates="users")
