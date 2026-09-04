import cv2
import numpy as np
import logging
from .config import CVConfig, normalize_plate_number

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

    def extract_text(self, crop):
        if crop is None or crop.size == 0:
            return {'raw_text': '', 'normalized_plate': '', 'confidence': 0.0}

        # 3x Bicubic Upscaling & Grayscale Conversion
        if len(crop.shape) == 3:
            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        else:
            gray = crop.copy()

        h, w = gray.shape
        if h < 90 or w < 220:
            gray = cv2.resize(gray, (w * 3, h * 3), interpolation=cv2.INTER_CUBIC)

        raw_text = ""
        confidence = 0.0

        if self.reader:
            try:
                # Pass 1: Contrast Enhancement with CLAHE
                clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
                enhanced = clahe.apply(gray)
                results = self.reader.readtext(enhanced, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

                # Pass 2: Retry with Otsu Binary Thresholding if Pass 1 yielded no text
                if not results:
                    _, otsu_inv = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
                    results = self.reader.readtext(otsu_inv, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

                # Pass 3: Retry with Grayscale Equalized Histogram
                if not results:
                    eq = cv2.equalizeHist(gray)
                    results = self.reader.readtext(eq, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

                if results:
                    # Sort left-to-right based on bounding box x-min coordinate
                    results_sorted = sorted(results, key=lambda item: item[0][0][0])
                    raw_text = " ".join([item[1] for item in results_sorted])
                    confidence = sum([float(item[2]) for item in results_sorted]) / len(results_sorted)
            except Exception as e:
                logger.error(f"Error during EasyOCR extraction: {e}")

        normalized = normalize_plate_number(raw_text)

        return {
            'raw_text': raw_text,
            'normalized_plate': normalized,
            'confidence': round(confidence, 2)
        }
