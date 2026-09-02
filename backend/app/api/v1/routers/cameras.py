from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Camera
from app.schemas import CameraCreate, CameraResponse

router = APIRouter(prefix="/cameras", tags=["Cameras"])

@router.get("", response_model=List[CameraResponse])
def get_cameras(
    city: Optional[str] = Query(None, description="Filter cameras by city"),
    department: Optional[str] = Query(None, description="Filter cameras by department"),
    status: Optional[str] = Query(None, description="Filter cameras by status"),
    db: Session = Depends(get_db)
):
    query = db.query(Camera)
    if city:
        query = query.filter(Camera.city.iloc(city))
    if department:
        query = query.filter(Camera.department.iloc(department))
    if status:
        query = query.filter(Camera.status == status)
    return query.all()

@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera_by_id(camera_id: str, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail=f"Camera with ID '{camera_id}' not found.")
    return camera

@router.post("", response_model=CameraResponse, status_code=201)
def create_camera(camera_in: CameraCreate, db: Session = Depends(get_db)):
    existing = db.query(Camera).filter(Camera.camera_id == camera_in.camera_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Camera with ID '{camera_in.camera_id}' already exists.")
    
    camera = Camera(**camera_in.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera
