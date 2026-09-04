"""
NETRA-GP Standalone Kafka Analytics Worker
Consumes stream ingestion tasks from 'netra.streams.ingest' topic,
runs YOLOv8 detection + EasyOCR via the cv_engine pipeline,
and publishes plate detection results to 'netra.detections.results'.

Usage:
    python kafka_worker.py
"""
import os
import sys
import json
import time
import socket
import logging
import datetime
from confluent_kafka import Consumer, Producer, KafkaError

# Load .env for local development
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Ensure cv_engine modules are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("AnalyticsWorker")

WORKER_ID = os.getenv("WORKER_ID", socket.gethostname())
KAFKA_BROKER = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
INGEST_TOPIC = os.getenv("KAFKA_TOPIC_STREAMS", "netra.streams.ingest")
RESULT_TOPIC = os.getenv("KAFKA_TOPIC_DETECTIONS", "netra.detections.results")
HEARTBEAT_INTERVAL = int(os.getenv("HEARTBEAT_INTERVAL_SECS", "60"))

# Lazy-loaded singletons
_detector = None
_ocr_engine = None


def get_detector():
    global _detector
    if _detector is None:
        from app.detector import LicensePlateDetector
        _detector = LicensePlateDetector()
    return _detector


def get_ocr():
    global _ocr_engine
    if _ocr_engine is None:
        from app.ocr import PlateOCREngine
        _ocr_engine = PlateOCREngine()
    return _ocr_engine


def run_anpr_pipeline(camera_id: str, stream_url: str) -> list:
    """
    Capture a single frame from the stream, run YOLOv8 plate detection + EasyOCR,
    and return a list of detection result dicts.
    """
    results_out = []
    try:
        import cv2
        cap = cv2.VideoCapture(stream_url)
        ret, frame = cap.read()
        cap.release()
        if not ret or frame is None:
            logger.warning(f"Could not read frame from {stream_url}")
            return results_out

        detector = get_detector()
        ocr = get_ocr()
        detections = detector.detect_plates(frame)

        for det in detections:
            crop = det.get("crop")
            if crop is None or crop.size == 0:
                continue

            try:
                from app.crop_enhancer import enhance_plate_crop
                enhanced = enhance_plate_crop(crop)
            except Exception:
                enhanced = crop

            ocr_result = ocr.extract_text(enhanced if enhanced is not None else crop)
            plate = ocr_result.get("normalized_plate") if ocr_result else None
            if plate and len(plate) >= 4:
                now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
                results_out.append({
                    "camera_id": camera_id,
                    "license_plate": plate,
                    "timestamp": now_iso,
                    "detection_confidence": round(det.get("confidence", 0.0), 2),
                    "ocr_confidence": round(float(ocr_result.get("confidence", 0.85)), 2),
                    "raw_ocr_text": ocr_result.get("raw_text", plate)
                })
    except Exception as e:
        logger.error(f"ANPR pipeline error for {camera_id}: {e}")
    return results_out


def main():
    logger.info(f"=== NETRA-GP Analytics Worker [{WORKER_ID}] ===")
    logger.info(f"  Broker:       {KAFKA_BROKER}")
    logger.info(f"  Ingest Topic: {INGEST_TOPIC}")
    logger.info(f"  Result Topic: {RESULT_TOPIC}")
    logger.info(f"  Heartbeat:    every {HEARTBEAT_INTERVAL}s")

    consumer = Consumer({
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': 'netra-analytics-workers',
        'auto.offset.reset': 'earliest'
    })
    producer = Producer({'bootstrap.servers': KAFKA_BROKER})

    consumer.subscribe([INGEST_TOPIC])
    logger.info(f"[{WORKER_ID}] Listening on topic: {INGEST_TOPIC}")

    last_heartbeat = time.time()
    processed_count = 0

    try:
        while True:
            msg = consumer.poll(1.0)

            # Periodic heartbeat for liveness monitoring
            if time.time() - last_heartbeat >= HEARTBEAT_INTERVAL:
                logger.info(f"[{WORKER_ID}] Heartbeat — alive, {processed_count} detections processed so far")
                last_heartbeat = time.time()

            if msg is None:
                continue
            if msg.error():
                if msg.error().code() != KafkaError._PARTITION_EOF:
                    logger.error(f"[{WORKER_ID}] Kafka error: {msg.error()}")
                continue

            task = json.loads(msg.value().decode("utf-8"))
            camera_id = task.get("camera_id")
            stream_url = task.get("stream_url")
            logger.info(f"[{WORKER_ID}] Processing stream task for camera: {camera_id}")

            detections = run_anpr_pipeline(camera_id, stream_url)
            for result in detections:
                producer.produce(RESULT_TOPIC, json.dumps(result).encode("utf-8"))
                producer.flush()
                processed_count += 1
                logger.info(f"[{WORKER_ID}] Published detection: {result['license_plate']} from {camera_id}")

    except KeyboardInterrupt:
        logger.info(f"[{WORKER_ID}] Shutdown requested. Total processed: {processed_count}")
    finally:
        consumer.close()


if __name__ == "__main__":
    main()

