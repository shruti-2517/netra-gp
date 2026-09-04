"""
NETRA-GP Kafka Producer Service
Provides async message publishing to Kafka topics for distributing stream
ingestion tasks and detection results across worker nodes.
"""
import json
import logging
from aiokafka import AIOKafkaProducer
from app.config import settings

logger = logging.getLogger("KafkaProducer")

_producer: AIOKafkaProducer = None


async def get_kafka_producer() -> AIOKafkaProducer:
    global _producer
    if _producer is None:
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode("utf-8")
        )
        try:
            await _producer.start()
            logger.info(f"Kafka producer connected to {settings.KAFKA_BOOTSTRAP_SERVERS}")
        except Exception as e:
            logger.warning(f"Kafka producer connection deferred (broker may be offline): {e}")
            _producer = None
    return _producer


async def publish_stream_task(camera_id: str, stream_url: str, department: str):
    """Publish a stream ingestion task to the Kafka streams topic."""
    producer = await get_kafka_producer()
    if producer is None:
        logger.debug("Kafka producer unavailable, skipping stream task publish.")
        return
    message = {
        "camera_id": camera_id,
        "stream_url": stream_url,
        "department": department,
        "action": "INGEST_STREAM"
    }
    await producer.send_and_wait(settings.KAFKA_TOPIC_STREAMS, message)
    logger.info(f"Published stream task for camera {camera_id} to {settings.KAFKA_TOPIC_STREAMS}")


async def publish_detection_result(detection_payload: dict):
    """Publish a detection result to the Kafka detections topic."""
    producer = await get_kafka_producer()
    if producer is None:
        logger.debug("Kafka producer unavailable, skipping detection result publish.")
        return
    await producer.send_and_wait(settings.KAFKA_TOPIC_DETECTIONS, detection_payload)
    logger.info(f"Published detection result for plate {detection_payload.get('license_plate', 'N/A')}")


async def shutdown_kafka_producer():
    global _producer
    if _producer:
        await _producer.stop()
        _producer = None
        logger.info("Kafka producer stopped.")
