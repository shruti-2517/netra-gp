"""
Backend Kafka Consumer: listens on 'netra.detections.results' topic
and persists detection events from remote analytics workers into PostgreSQL,
running watchlist correlation on each incoming plate read.
"""
import json
import asyncio
import logging
from aiokafka import AIOKafkaConsumer
from app.config import settings
from app.database import SessionLocal
from app.models import DetectionEvent
from app.services.matcher import WatchlistMatcher

logger = logging.getLogger("KafkaConsumer")

MAX_RETRIES = 5
RETRY_BASE_DELAY = 3  # seconds, doubles each attempt


async def start_detection_consumer():
    """
    Connects to Kafka with exponential backoff retry and continuously
    consumes detection results, persisting them into PostgreSQL.
    """
    consumer = AIOKafkaConsumer(
        settings.KAFKA_TOPIC_DETECTIONS,
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        group_id="netra-backend-consumer",
        value_deserializer=lambda m: json.loads(m.decode("utf-8"))
    )

    # Retry loop — broker may not be ready at backend startup
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            await consumer.start()
            logger.info(f"Connected to Kafka on attempt {attempt}, listening on {settings.KAFKA_TOPIC_DETECTIONS}")
            break
        except Exception as e:
            delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
            logger.warning(f"Kafka connection attempt {attempt}/{MAX_RETRIES} failed: {e}. Retrying in {delay}s...")
            if attempt == MAX_RETRIES:
                logger.error("Kafka consumer could not connect after max retries — running without live detection ingestion.")
                return
            await asyncio.sleep(delay)

    processed_count = 0
    try:
        async for msg in consumer:
            data = msg.value
            db = SessionLocal()
            try:
                matched, _ = WatchlistMatcher.match_plate(db, data.get("license_plate", ""))
                event = DetectionEvent(
                    camera_id=data.get("camera_id", "unknown"),
                    timestamp=data.get("timestamp", ""),
                    license_plate=data.get("license_plate", ""),
                    raw_ocr_text=data.get("raw_ocr_text", data.get("license_plate", "")),
                    detection_confidence=data.get("detection_confidence", 0.0),
                    ocr_confidence=data.get("ocr_confidence", 0.0),
                    is_watchlist_hit=matched is not None,
                    threat_level=matched.threat_level if matched else None
                )
                db.add(event)
                db.commit()
                processed_count += 1
                logger.info(f"Persisted Kafka detection #{processed_count}: {event.license_plate} from {event.camera_id}")
            except Exception as e:
                logger.error(f"Error persisting Kafka detection: {e}")
                db.rollback()
            finally:
                db.close()
    except Exception as e:
        logger.warning(f"Kafka consumer loop ended ({processed_count} events processed): {e}")
    finally:
        await consumer.stop()

