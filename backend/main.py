import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, SessionLocal, get_db
from app.models import Camera
from app.seed import seed_initial_data
from app.services.websocket_manager import manager
from app.services.live_streamer import generate_live_stream_frames
from app.api.v1.routers import auth, cameras, watchlist, detections, reports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NETRA-GP-Backend")

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed initial data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(cameras.router, prefix=settings.API_V1_STR)
app.include_router(watchlist.router, prefix=settings.API_V1_STR)
app.include_router(detections.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

# Mount Sample Video Feeds if directory exists
feeds_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "sample_feeds")
if os.path.exists(feeds_dir):
    app.mount("/sample_feeds", StaticFiles(directory=feeds_dir), name="sample_feeds")

# Official Spec Contract: Catalogue API Endpoint (/api/ingest)
@app.get("/api/ingest")
def get_ingest_catalogue(db: Session = Depends(get_db)):
    """
    Official Specification Endpoint returning dynamic camera catalogue,
    codec metadata, live status, and RTSP / WebRTC (WHEP) / HLS endpoints.
    """
    db_cams = db.query(Camera).all()
    catalogue = []
    for c in db_cams:
        cam_id = c.camera_id
        rtsp_url = c.stream_url if c.stream_url.startswith("rtsp://") else f"rtsp://localhost:8554/stream/{cam_id}"
        whep_url = f"http://localhost:8889/stream/{cam_id}/whep"
        hls_url = f"http://localhost/live/stream/{cam_id}/index.m3u8"

        catalogue.append({
            "id": cam_id,
            "camera_id": cam_id,
            "name": c.name,
            "city": c.city,
            "department": c.department,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "codec": "H.264",
            "live_status": c.status.lower(),
            "stream_url": c.stream_url,
            "endpoints": {
                "rtsp": rtsp_url,
                "whep": whep_url,
                "hls": hls_url
            }
        })
    return catalogue

# Live Real-Time OpenCV & YOLO Stream Endpoint
@app.get("/api/v1/streams/live/{camera_id}")
def get_live_camera_stream(camera_id: str):
    """
    Streams live MJPEG video with real-time YOLO bounding boxes, vehicle telemetry,
    and automatic alert triggering directly to web browsers.
    """
    return StreamingResponse(
        generate_live_stream_frames(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# Real-Time WebSocket Alerts Endpoint
@app.websocket("/api/v1/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": "1.0.0",
        "catalogue_endpoint": "/api/ingest",
        "documentation": "/docs"
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
