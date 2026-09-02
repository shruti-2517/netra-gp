import csv
import io
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DetectionEvent, Alert, Camera

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.get("/export-csv")
def export_detections_csv(db: Session = Depends(get_db)):
    """
    Exports all timestamped ANPR detection events and watchlist hits as a downloadable CSV report.
    """
    detections = db.query(DetectionEvent).order_by(DetectionEvent.id.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row
    writer.writerow([
        "Event ID", "Camera ID", "Timestamp", "Normalized License Plate", 
        "Raw OCR Text", "Detection Confidence", "OCR Confidence", 
        "Watchlist Hit", "Threat Level"
    ])
    
    for d in detections:
        writer.writerow([
            d.id,
            d.camera_id,
            d.timestamp,
            d.license_plate,
            d.raw_ocr_text,
            f"{d.detection_confidence:.2f}",
            f"{d.ocr_confidence:.2f}",
            "YES" if d.is_watchlist_hit else "NO",
            d.threat_level or "NONE"
        ])
    
    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=netra_gp_anpr_report.csv"}
    )
