import logging
import time
from app.stream import VideoStreamReader
from app.detector import LicensePlateDetector
from app.ocr import PlateOCREngine
from app.config import CVConfig

logger = logging.getLogger("ANPRPipeline")

class ANPRPipeline:
    def __init__(self, model_path=None):
        logger.info("Initializing NETRA-GP ANPR Pipeline...")
        self.detector = LicensePlateDetector(model_path=model_path)
        self.ocr_engine = PlateOCREngine()

    def process_video_feed(self, source, camera_id=CVConfig.DEFAULT_CAMERA_ID, sample_rate=CVConfig.FRAME_SAMPLE_RATE, demo_fallback=False):
        """
        Processes a video file or stream source, yields detection events.
        Strict genuine OCR is used by default. Set demo_fallback=True only for synthetic demo testing.
        """
        reader = VideoStreamReader(source=source, frame_sample_rate=sample_rate)
        
        logger.info(f"Pipeline started for Camera [{camera_id}] on source: {source} (demo_fallback={demo_fallback})")
        
        demo_watchlist_plates = ["GJ01AB1234", "GJ18CD5678", "GJ05EF9012", "GJ27XY9999", "GJ03KL4321"]
        demo_idx = 0
        
        for frame_num, timestamp, frame in reader.read_frames():
            detections = self.detector.detect_plates(frame)
            
            for det in detections:
                ocr_result = self.ocr_engine.extract_text(det['crop'])
                plate_read = ocr_result['normalized_plate'] if (ocr_result and len(ocr_result['normalized_plate']) >= 3) else None
                
                # Synthetic fallback enabled ONLY when demo_fallback flag is explicitly set
                if not plate_read and demo_fallback and det.get('confidence', 0) >= 0.35:
                    plate_read = demo_watchlist_plates[demo_idx % len(demo_watchlist_plates)]
                    demo_idx += 1
                    ocr_result = {'raw_text': plate_read, 'confidence': 0.88}

                if plate_read:
                    event = {
                        'camera_id': camera_id,
                        'frame_number': frame_num,
                        'timestamp': timestamp,
                        'license_plate': plate_read,
                        'raw_ocr_text': ocr_result.get('raw_text', plate_read),
                        'detection_confidence': round(det['confidence'], 2),
                        'ocr_confidence': round(ocr_result.get('confidence', 0.88), 2),
                        'bbox': det['bbox']
                    }
                    logger.info(f"[PLATE DETECTED] Camera: {camera_id} | Plate: {plate_read} | Conf: {event['ocr_confidence']:.2f}")
                    yield event

    def process_single_image(self, image_path, camera_id=CVConfig.DEFAULT_CAMERA_ID):
        """
        Processes a single static image file
        """
        import cv2
        frame = cv2.imread(image_path)
        if frame is None:
            logger.error(f"Failed to read image at: {image_path}")
            return []

        results = []
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        detections = self.detector.detect_plates(frame)
        
        for det in detections:
            ocr_result = self.ocr_engine.extract_text(det['crop'])
            if ocr_result:
                results.append({
                    'camera_id': camera_id,
                    'timestamp': timestamp,
                    'license_plate': ocr_result['normalized_plate'],
                    'raw_ocr_text': ocr_result['raw_text'],
                    'detection_confidence': round(det['confidence'], 2),
                    'ocr_confidence': round(ocr_result['confidence'], 2),
                    'bbox': det['bbox']
                })
        return results
