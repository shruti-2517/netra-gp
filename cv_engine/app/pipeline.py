import logging
import time
import requests
from app.stream import VideoStreamReader
from app.detector import LicensePlateDetector
from app.ocr import PlateOCREngine
from app.config import CVConfig

from app.vmmc import VMMCClassifier

logger = logging.getLogger("ANPRPipeline")

class ANPRPipeline:
    def __init__(self, model_path=None):
        logger.info("Initializing NETRA-GP ANPR Pipeline (100% Genuine OCR & VMMC Engine)...")
        self.detector = LicensePlateDetector(model_path=model_path)
        self.ocr_engine = PlateOCREngine()

    def process_video_feed(self, source, camera_id=CVConfig.DEFAULT_CAMERA_ID, sample_rate=CVConfig.FRAME_SAMPLE_RATE):
        """
        Processes a video file or live stream source (RTSP, WebRTC/WHEP, HLS), yields genuine ANPR detection events.
        Strict 100% genuine OCR extraction — zero synthetic or simulated fallbacks.
        """
        reader = VideoStreamReader(source=source, frame_sample_rate=sample_rate)
        logger.info(f"Pipeline started for Camera [{camera_id}] on source: {source}")
        
        for frame_num, pts_ms, timestamp, frame in reader.read_frames():
            detections = self.detector.detect_plates(frame)
            
            for det in detections:
                ocr_result = self.ocr_engine.extract_text(det['crop'])
                if ocr_result and ocr_result.get('normalized_plate') and len(ocr_result['normalized_plate']) >= 3:
                    plate_read = ocr_result['normalized_plate']
                    
                    # Phase 2: Classify Vehicle Color & Body Type
                    v_color = VMMCClassifier.classify_vehicle_color(det.get('crop'))
                    v_type = VMMCClassifier.classify_vehicle_type(det.get('bbox'), frame.shape)

                    event = {
                        'camera_id': camera_id,
                        'frame_number': frame_num,
                        'pts_ms': round(pts_ms, 2),
                        'timestamp': timestamp,
                        'license_plate': plate_read,
                        'raw_ocr_text': ocr_result.get('raw_text', plate_read),
                        'vehicle_color': v_color,
                        'vehicle_type': v_type,
                        'detection_confidence': round(det['confidence'], 2),
                        'ocr_confidence': round(ocr_result.get('confidence', 0.0), 2),
                        'bbox': det['bbox']
                    }
                    logger.info(f"[GENUINE PLATE READ] Camera: {camera_id} | Plate: {plate_read} | Color: {v_color} | Type: {v_type} | PTS: {pts_ms:.1f}ms | Conf: {event['ocr_confidence']:.2f}")

                    # Dispatch event to Backend API if running
                    try:
                        requests.post("http://localhost:8000/api/v1/detections", json=event, timeout=0.5)
                    except Exception:
                        pass

                    yield event

    def process_single_image(self, image_path, camera_id=CVConfig.DEFAULT_CAMERA_ID):
        """
        Processes a single static image file with 100% genuine OCR
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
            if ocr_result and ocr_result.get('normalized_plate') and len(ocr_result['normalized_plate']) >= 3:
                results.append({
                    'camera_id': camera_id,
                    'pts_ms': 0.0,
                    'timestamp': timestamp,
                    'license_plate': ocr_result['normalized_plate'],
                    'raw_ocr_text': ocr_result['raw_text'],
                    'detection_confidence': round(det['confidence'], 2),
                    'ocr_confidence': round(ocr_result['confidence'], 2),
                    'bbox': det['bbox']
                })
        return results
