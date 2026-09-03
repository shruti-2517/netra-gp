"""
NETRA-GP Computer Vision & ANPR Processing Engine
Fully compliant with Official Camera Grid Integration Specification & Catalogue API

Usage:
    # 1. From Dynamic Catalogue API (/api/ingest contract)
    python main.py --camera CAM-AHM-001

    # 2. Direct Source Execution (RTSP/File)
    python main.py --source data/sample_feeds/traffic1.mp4 --camera CAM-AHM-001
"""
import argparse
import sys
import logging
from app.pipeline import ANPRPipeline
from app.catalogue import CatalogueService

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("NETRA-GP-CV")

def main():
    parser = argparse.ArgumentParser(description="NETRA-GP ANPR Computer Vision Engine")
    parser.add_argument("--source", type=str, default=None, help="Path to video file or RTSP URL (e.g. rtsp://<host>:8554/stream/1)")
    parser.add_argument("--camera", type=str, default="CAM-AHM-001", help="Camera ID to resolve from /api/ingest catalogue contract")
    parser.add_argument("--protocol", type=str, default="rtsp", choices=["rtsp", "whep", "hls"], help="Stream protocol preference")
    parser.add_argument("--model", type=str, default=None, help="Path to YOLOv8 license plate weights (.pt)")
    args = parser.parse_args()

    logger.info("Initializing NETRA-GP Genuine Computer Vision Engine...")
    
    # 1. Catalogue Resolution per Official Specification
    source_url = args.source
    if not source_url:
        logger.info(f"No direct --source URL provided. Querying dynamic /api/ingest catalogue for camera [{args.camera}]...")
        catalogue = CatalogueService()
        source_url = catalogue.get_stream_url(camera_id=args.camera, protocol=args.protocol)
        if not source_url:
            source_url = "data/sample_feeds/traffic1.mp4"
            logger.warning(f"Camera [{args.camera}] not found in live catalogue. Falling back to default source: {source_url}")

    # Resolve relative file path if running from cv_engine subfolder or root
    import os
    if not source_url.startswith(("rtsp://", "http://", "https://", "rtsps://")) and not source_url.isdigit():
        if not os.path.exists(source_url):
            alt_path = os.path.join("..", source_url)
            if os.path.exists(alt_path):
                source_url = os.path.abspath(alt_path)
            elif os.path.exists(os.path.join("data", "sample_feeds", "traffic1.mp4")):
                source_url = os.path.abspath(os.path.join("data", "sample_feeds", "traffic1.mp4"))
            elif os.path.exists(os.path.join("..", "data", "sample_feeds", "traffic1.mp4")):
                source_url = os.path.abspath(os.path.join("..", "data", "sample_feeds", "traffic1.mp4"))
    elif source_url.isdigit():
        source_url = int(source_url)

    logger.info(f"Resolved Stream URL: {source_url} (Protocol: {args.protocol.upper()})")

    # 2. Pipeline Execution (100% Genuine OCR)
    pipeline = ANPRPipeline(model_path=args.model)
    logger.info(f"Starting feed processing for Camera [{args.camera}] from source [{source_url}]...")
    
    try:
        detection_count = 0
        for detection_event in pipeline.process_video_feed(source=source_url, camera_id=args.camera):
            detection_count += 1
            print(f"\n[GENUINE ANPR DETECTED EVENT #{detection_count}]:")
            print(f"   - Camera ID:   {detection_event['camera_id']}")
            print(f"   - PTS (ms):    {detection_event.get('pts_ms', 0.0)} ms")
            print(f"   - Timestamp:   {detection_event['timestamp']}")
            print(f"   - Plate Read:  {detection_event['license_plate']}")
            print(f"   - BoundingBox: {detection_event['bbox']}")
            print(f"   - Confidence:  {detection_event['ocr_confidence']}")
            
        logger.info(f"Feed processing completed. Total genuine plates detected: {detection_count}")
    except KeyboardInterrupt:
        logger.info("ANPR Engine stopped by user.")
    except Exception as e:
        logger.error(f"Error during video stream execution: {e}")

if __name__ == "__main__":
    main()
