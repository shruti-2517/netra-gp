"""
NETRA-GP Computer Vision & ANPR Processing Engine
Usage:
    python main.py --source data/sample_video.mp4 --camera CAM-AHM-001
"""
import argparse
import sys
import logging
from app.pipeline import ANPRPipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("NETRA-GP-CV")

def main():
    parser = argparse.ArgumentParser(description="NETRA-GP ANPR Computer Vision Engine")
    parser.add_argument("--source", type=str, default="sample.mp4", help="Path to video file or RTSP URL")
    parser.add_argument("--camera", type=str, default="CAM-AHM-001", help="Camera ID")
    parser.add_argument("--model", type=str, default=None, help="Path to YOLOv8 license plate weights (.pt)")
    parser.add_argument("--demo", action="store_true", help="Enable synthetic plate fallback for stock video feeds")
    args = parser.parse_args()

    logger.info("Initializing NETRA-GP Computer Vision Engine...")
    pipeline = ANPRPipeline(model_path=args.model)
    
    logger.info(f"Starting feed processing for Camera [{args.camera}] from source [{args.source}]...")
    
    try:
        detection_count = 0
        for detection_event in pipeline.process_video_feed(source=args.source, camera_id=args.camera, demo_fallback=args.demo):
            detection_count += 1
            print(f"\n[DETECTED EVENT #{detection_count}]:")
            print(f"   - Camera ID:   {detection_event['camera_id']}")
            print(f"   - Timestamp:   {detection_event['timestamp']}")
            print(f"   - Plate Read:  {detection_event['license_plate']}")
            print(f"   - BoundingBox: {detection_event['bbox']}")
            print(f"   - Confidence:  {detection_event['ocr_confidence']}")
            
        logger.info(f"Feed processing completed. Total plates detected: {detection_count}")
    except KeyboardInterrupt:
        logger.info("ANPR Engine stopped by user.")
    except Exception as e:
        logger.error(f"Error during video stream execution: {e}")

if __name__ == "__main__":
    main()
