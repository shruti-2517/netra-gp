"""
NETRA-GP: Government Test Feed Batch Processor & Automated Report Generator
Evaluates genuine ANPR OCR performance across test video feeds.
Usage:
    python data/batch_feed_processor.py --feeds_dir data/sample_feeds --output data/reports
"""
import os
import sys
import glob
import time
import csv
import argparse
import logging

# Add cv_engine to path
sys.path.insert(0, os.path.abspath("cv_engine"))
sys.path.insert(0, os.path.abspath("backend"))

from app.pipeline import ANPRPipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("BatchProcessor")

def run_batch_processor(feeds_dir: str, output_dir: str):
    logger.info(f"Starting NETRA-GP Government Test Feed Batch Ingestion...")
    logger.info(f"Input Directory: {feeds_dir}")
    logger.info(f"Output Reports Directory: {output_dir}")

    os.makedirs(output_dir, exist_ok=True)

    video_files = glob.glob(os.path.join(feeds_dir, "*.mp4"))
    if not video_files:
        logger.warning(f"No .mp4 video feeds found in {feeds_dir}")
        return

    logger.info(f"Found {len(video_files)} video feeds for batch processing.")
    
    pipeline = ANPRPipeline()
    batch_results = []
    total_detections_all = 0

    csv_path = os.path.join(output_dir, "batch_anpr_summary.csv")
    
    with open(csv_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            "Feed Name", "Camera ID", "Frame Number", "Timestamp", 
            "License Plate", "Raw OCR Text", "Detection Confidence", "OCR Confidence"
        ])

        for vid_path in video_files:
            feed_name = os.path.basename(vid_path)
            camera_id = f"CAM-BATCH-{feed_name[:6]}"
            logger.info(f"\nProcessing feed [{feed_name}] for Camera [{camera_id}]...")

            start_t = time.time()
            feed_detections = 0

            try:
                # 100% Genuine OCR processing
                for event in pipeline.process_video_feed(source=vid_path, camera_id=camera_id):
                    feed_detections += 1
                    total_detections_all += 1

                    writer.writerow([
                        feed_name,
                        event['camera_id'],
                        event['frame_number'],
                        event['timestamp'],
                        event['license_plate'],
                        event['raw_ocr_text'],
                        event['detection_confidence'],
                        event['ocr_confidence']
                    ])

                elapsed = time.time() - start_t
                logger.info(f"Feed [{feed_name}] finished in {elapsed:.2f}s | Plates Detected: {feed_detections}")
                batch_results.append({
                    "feed": feed_name,
                    "detections": feed_detections,
                    "duration_sec": round(elapsed, 2)
                })
            except Exception as e:
                logger.error(f"Error processing feed [{feed_name}]: {e}")

    # Generate Summary Markdown Audit Log
    summary_path = os.path.join(output_dir, "batch_processing_audit_log.md")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write("# NETRA-GP Government Test Feed Batch Processing Audit Summary\n")
        f.write(f"**Execution Timestamp**: {time.strftime('%Y-%m-%d %H:%M:%S IST')}\n")
        f.write(f"**Total Feeds Processed**: {len(video_files)}\n")
        f.write(f"**Total License Plates Detected**: {total_detections_all}\n\n")
        f.write("## Feed Breakdown\n\n")
        f.write("| Video Feed File | Total ANPR Detections | Processing Time (sec) |\n")
        f.write("| :--- | :--- | :--- |\n")
        for r in batch_results:
            f.write(f"| `{r['feed']}` | {r['detections']} | {r['duration_sec']}s |\n")

    logger.info(f"\nBatch Processing Complete!")
    logger.info(f"   CSV Detailed Log: {csv_path}")
    logger.info(f"   Markdown Summary: {summary_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NETRA-GP Government Test Feed Batch Processor")
    parser.add_argument("--feeds_dir", type=str, default="data/sample_feeds", help="Directory containing test video feeds")
    parser.add_argument("--output", type=str, default="data/reports", help="Output directory for reports")
    args = parser.parse_args()

    run_batch_processor(args.feeds_dir, args.output)
