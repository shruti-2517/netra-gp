import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DetectionEvent, Alert, Camera, WatchlistVehicle
from app.schemas import DetectionEventCreate, DetectionEventResponse, AlertResponse, RouteTraceResponse, RouteWaypoint
from app.services.matcher import WatchlistMatcher
from app.services.websocket_manager import manager

router = APIRouter(tags=["Detections & Alerts"])

@router.post("/detections", response_model=DetectionEventResponse, status_code=201)
async def ingest_detection(detection_in: DetectionEventCreate, db: Session = Depends(get_db)):
    """
    Ingests an ANPR detection event from CV Engine, correlates plate against Watchlist DB,
    stores detection audit log, and dispatches WebSocket alert if matched.
    """
    bbox_str = ",".join(map(str, detection_in.bbox)) if detection_in.bbox else ""

    # Run Watchlist Matching Engine (exact + canonical + fuzzy matching)
    matched_vehicle, match_conf = WatchlistMatcher.match_plate(db, detection_in.license_plate)
    
    is_hit = matched_vehicle is not None
    threat = matched_vehicle.threat_level if matched_vehicle else None

    # Record Detection Event
    event = DetectionEvent(
        camera_id=detection_in.camera_id,
        timestamp=detection_in.timestamp,
        license_plate=detection_in.license_plate,
        raw_ocr_text=detection_in.raw_ocr_text or detection_in.license_plate,
        detection_confidence=detection_in.detection_confidence,
        ocr_confidence=detection_in.ocr_confidence,
        bbox=bbox_str,
        is_watchlist_hit=is_hit,
        threat_level=threat
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # If Watchlist Hit, Generate Alert & Broadcast via WebSocket
    if is_hit and matched_vehicle:
        camera = db.query(Camera).filter(Camera.camera_id == detection_in.camera_id).first()
        cam_name = camera.name if camera else detection_in.camera_id
        city_name = camera.city if camera else "Gujarat State"

        alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        alert_obj = Alert(
            alert_id=alert_id,
            camera_id=detection_in.camera_id,
            camera_name=cam_name,
            city=city_name,
            license_plate=detection_in.license_plate,
            vehicle_info=f"{matched_vehicle.color or ''} {matched_vehicle.vehicle_make or 'Vehicle'}".strip(),
            reason=matched_vehicle.reason or "Watchlist Match",
            threat_level=matched_vehicle.threat_level or "HIGH",
            category=matched_vehicle.category or "STOLEN",
            timestamp=detection_in.timestamp,
            is_read=False
        )
        db.add(alert_obj)
        db.commit()
        db.refresh(alert_obj)

        # WebSocket Payload
        payload = {
            "event": "WATCHLIST_ALERT",
            "alert_id": alert_obj.alert_id,
            "camera_id": alert_obj.camera_id,
            "camera_name": alert_obj.camera_name,
            "city": alert_obj.city,
            "license_plate": alert_obj.license_plate,
            "vehicle_info": alert_obj.vehicle_info,
            "reason": alert_obj.reason,
            "threat_level": alert_obj.threat_level,
            "category": alert_obj.category,
            "timestamp": alert_obj.timestamp,
            "latitude": camera.latitude if camera else 23.0298,
            "longitude": camera.longitude if camera else 72.5074,
            "match_confidence": round(match_conf * 100, 1)
        }
        await manager.broadcast(payload)

    return event

@router.get("/detections", response_model=List[DetectionEventResponse])
def get_recent_detections(
    camera_id: Optional[str] = Query(None),
    watchlist_only: bool = Query(False),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(DetectionEvent)
    if camera_id:
        query = query.filter(DetectionEvent.camera_id == camera_id)
    if watchlist_only:
        query = query.filter(DetectionEvent.is_watchlist_hit == True)
    return query.order_by(DetectionEvent.id.desc()).limit(limit).all()

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(limit: int = Query(30, le=100), db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.id.desc()).limit(limit).all()

@router.get("/tracking/{license_plate}", response_model=RouteTraceResponse)
def trace_vehicle_route(license_plate: str, db: Session = Depends(get_db)):
    """
    Queries historical detection events for a target license plate, orders them chronologically,
    and returns GIS route waypoints for spatial timeline reconstruction.
    """
    clean_target = license_plate.replace("-", "").replace(" ", "").upper()
    
    # Query all detections matching the plate number
    detections = db.query(DetectionEvent).filter(
        DetectionEvent.license_plate.ilike(f"%{clean_target}%")
    ).order_by(DetectionEvent.id.asc()).all()

    if not detections:
        # Check canonical match fallback
        all_events = db.query(DetectionEvent).all()
        detections = [e for e in all_events if clean_target in e.license_plate.replace("-", "").replace(" ", "").upper()]

    waypoints = []
    seq = 1
    for det in detections:
        camera = db.query(Camera).filter(Camera.camera_id == det.camera_id).first()
        waypoints.append(RouteWaypoint(
            sequence=seq,
            camera_id=det.camera_id,
            camera_name=camera.name if camera else det.camera_id,
            city=camera.city if camera else "Gujarat",
            latitude=camera.latitude if camera else 23.0,
            longitude=camera.longitude if camera else 72.5,
            timestamp=det.timestamp,
            confidence=det.ocr_confidence
        ))
        seq += 1

    return RouteTraceResponse(
        license_plate=license_plate.upper(),
        total_detections=len(waypoints),
        waypoints=waypoints
    )
