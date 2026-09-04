from pydantic import BaseModel, Field
from typing import Optional, List

# Camera Schemas
class CameraBase(BaseModel):
    camera_id: str
    name: str
    department: str
    city: str
    latitude: float
    longitude: float
    stream_url: str
    type: str = "Fixed IP Camera"
    status: str = "ACTIVE"

class CameraCreate(CameraBase):
    pass

class CameraResponse(CameraBase):
    id: int

    class Config:
        from_attributes = True

# Watchlist Schemas
class WatchlistBase(BaseModel):
    watchlist_id: str
    license_plate: str
    vehicle_make: Optional[str] = None
    color: Optional[str] = None
    reason: Optional[str] = None
    category: str = "STOLEN"
    threat_level: str = "HIGH"
    owner_name: Optional[str] = None

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistResponse(WatchlistBase):
    id: int

    class Config:
        from_attributes = True

# Detection Schemas
class DetectionEventCreate(BaseModel):
    camera_id: str
    timestamp: str
    license_plate: str
    raw_ocr_text: Optional[str] = None
    detection_confidence: float = 0.0
    ocr_confidence: float = 0.0
    bbox: Optional[List[int]] = None
    vehicle_color: Optional[str] = "UNKNOWN"
    vehicle_type: Optional[str] = "VEHICLE"

class DetectionEventResponse(BaseModel):
    id: int
    camera_id: str
    timestamp: str
    license_plate: str
    raw_ocr_text: Optional[str] = None
    detection_confidence: float
    ocr_confidence: float
    vehicle_color: Optional[str] = "UNKNOWN"
    vehicle_type: Optional[str] = "VEHICLE"
    speed_kmh: Optional[float] = None
    is_speed_violation: bool = False
    evidence_hash: Optional[str] = None
    is_watchlist_hit: bool
    threat_level: Optional[str] = None

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: int
    alert_id: str
    camera_id: str
    camera_name: Optional[str] = None
    city: Optional[str] = None
    license_plate: str
    vehicle_info: Optional[str] = None
    reason: Optional[str] = None
    threat_level: str
    category: Optional[str] = None
    timestamp: str
    is_read: bool

    class Config:
        from_attributes = True

# Route Tracing Schemas
class RouteWaypoint(BaseModel):
    sequence: int
    camera_id: str
    camera_name: str
    city: str
    latitude: float
    longitude: float
    timestamp: str
    confidence: float
    speed_kmh: Optional[float] = None

class RouteTraceResponse(BaseModel):
    license_plate: str
    total_detections: int
    waypoints: List[RouteWaypoint]

# Evidence Certificate Schemas (BSA 2023)
class EvidenceCertificateResponse(BaseModel):
    id: int
    certificate_id: str
    detection_id: int
    license_plate: str
    camera_id: str
    violation_type: str
    speed_recorded_kmh: Optional[float] = None
    speed_limit_kmh: float = 80.0
    fine_amount_inr: int = 1000
    sha256_hash: str
    digital_signature: str
    bsa_admissibility_code: str
    status: str

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    is_active: bool = True
    department_id: int
    role_id: int

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True
