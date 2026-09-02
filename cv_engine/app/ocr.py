import cv2
import numpy as np
import logging
from app.config import CVConfig, normalize_plate_number

logger = logging.getLogger("PlateOCREngine")

class PlateOCREngine:
    def __init__(self):
        self.reader = None
        try:
            import easyocr
            logger.info("Initializing EasyOCR Engine...")
            self.reader = easyocr.Reader(CVConfig.OCR_LANGUAGES, gpu=False)
            logger.info("EasyOCR Engine initialized successfully.")
        except Exception as e:
            logger.warning(f"EasyOCR initialization issue ({e}). Using basic OCR fallback mode.")

    def preprocess_crop(self, crop):
        """
        Enhance plate image contrast and readability for OCR
        """
        if crop is None or crop.size == 0:
            return None
        
        # Convert to grayscale
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        
        # Resize if crop is small
        h, w = gray.shape
        if h < 60 or w < 160:
            gray = cv2.resize(gray, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
            
        # Bilateral filter to smooth noise while keeping edges sharp
        filtered = cv2.bilateralFilter(gray, 11, 17, 17)
        
        # Otsu thresholding
        _, thresh = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return thresh

    def extract_text(self, crop):
        if crop is None or crop.size == 0:
            return None

        # Clean 2x/3x enlarged grayscale image for EasyOCR
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        if h < 80 or w < 200:
            gray = cv2.resize(gray, (w * 3, h * 3), interpolation=cv2.INTER_CUBIC)

        raw_text = ""
        confidence = 0.0

        if self.reader:
            try:
                results = self.reader.readtext(gray, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
                if not results:
                    # Retry with contrast stretching
                    enhanced = cv2.equalizeHist(gray)
                    results = self.reader.readtext(enhanced, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
                
                if results:
                    # Sort text blocks left-to-right based on bounding box x-coordinate
                    results_sorted = sorted(results, key=lambda item: item[0][0][0])
                    raw_text = " ".join([item[1] for item in results_sorted])
                    confidence = sum([float(item[2]) for item in results_sorted]) / len(results_sorted)
            except Exception as e:
                logger.error(f"Error during EasyOCR extraction: {e}")

        normalized = normalize_plate_number(raw_text)

        return {
            'raw_text': raw_text,
            'normalized_plate': normalized,
            'confidence': confidence
        }
