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

class DetectionEventResponse(BaseModel):
    id: int
    camera_id: str
    timestamp: str
    license_plate: str
    raw_ocr_text: Optional[str] = None
    detection_confidence: float
    ocr_confidence: float
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

class RouteTraceResponse(BaseModel):
    license_plate: str
    total_detections: int
    waypoints: List[RouteWaypoint]
