from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WatchlistVehicle
from app.schemas import WatchlistCreate, WatchlistResponse

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

@router.get("", response_model=List[WatchlistResponse])
def get_watchlist(
    category: Optional[str] = Query(None, description="Filter watchlist by category (STOLEN, CRIMINAL_WANTED, etc.)"),
    threat_level: Optional[str] = Query(None, description="Filter by threat level (CRITICAL, HIGH, MEDIUM)"),
    db: Session = Depends(get_db)
):
    query = db.query(WatchlistVehicle)
    if category:
        query = query.filter(WatchlistVehicle.category == category)
    if threat_level:
        query = query.filter(WatchlistVehicle.threat_level == threat_level)
    return query.all()

@router.post("", response_model=WatchlistResponse, status_code=201)
def add_to_watchlist(vehicle_in: WatchlistCreate, db: Session = Depends(get_db)):
    existing = db.query(WatchlistVehicle).filter(WatchlistVehicle.watchlist_id == vehicle_in.watchlist_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Watchlist entry '{vehicle_in.watchlist_id}' already exists.")
    
    vehicle = WatchlistVehicle(**vehicle_in.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{watchlist_id}", status_code=200)
def remove_from_watchlist(watchlist_id: str, db: Session = Depends(get_db)):
    vehicle = db.query(WatchlistVehicle).filter(WatchlistVehicle.watchlist_id == watchlist_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Watchlist entry '{watchlist_id}' not found.")
    db.delete(vehicle)
    db.commit()
    return {"status": "deleted", "watchlist_id": watchlist_id}
