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
            logger.info("Initializing EasyOCR Engine with optimized parameters...")
            self.reader = easyocr.Reader(CVConfig.OCR_LANGUAGES, gpu=False)
            logger.info("EasyOCR Engine initialized successfully.")
        except Exception as e:
            logger.warning(f"EasyOCR initialization issue ({e}). Using basic OCR fallback mode.")

    def extract_text(self, crop):
        if crop is None or crop.size == 0:
            return {'raw_text': '', 'normalized_plate': '', 'confidence': 0.0}

        # Grayscale conversion & Multi-scale upscaling
        if len(crop.shape) == 3:
            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        else:
            gray = crop.copy()

        h, w = gray.shape
        if h < 100 or w < 280:
            scale = max(3.0, 320.0 / float(w if w > 0 else 1))
            gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_LANCZOS4)

        raw_text = ""
        confidence = 0.0

        if self.reader:
            try:
                # Pass 1: CLAHE Contrast Sharpening + Tuned Detection Thresholds
                clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
                enhanced = clahe.apply(gray)
                
                results = self.reader.readtext(
                    enhanced,
                    allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                    text_threshold=0.25,
                    low_text=0.20,
                    link_threshold=0.30,
                    canvas_size=1280
                )

                # Pass 2: Retry with Otsu Inverted Binarization if Pass 1 yielded < 6 characters
                pass1_text = "".join([item[1] for item in sorted(results, key=lambda item: item[0][0][0])]) if results else ""
                if len(pass1_text) < 6:
                    _, otsu_bin = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                    results2 = self.reader.readtext(
                        otsu_bin,
                        allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                        text_threshold=0.20,
                        low_text=0.15,
                        link_threshold=0.25
                    )
                    pass2_text = "".join([item[1] for item in sorted(results2, key=lambda item: item[0][0][0])]) if results2 else ""
                    if len(pass2_text) > len(pass1_text):
                        results = results2

                # Pass 3: Adaptive Gaussian Thresholding if text is still too short
                current_text = "".join([item[1] for item in sorted(results, key=lambda item: item[0][0][0])]) if results else ""
                if len(current_text) < 6:
                    adaptive = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
                    results3 = self.reader.readtext(
                        adaptive,
                        allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                        text_threshold=0.20,
                        low_text=0.15
                    )
                    pass3_text = "".join([item[1] for item in sorted(results3, key=lambda item: item[0][0][0])]) if results3 else ""
                    if len(pass3_text) > len(current_text):
                        results = results3

                if results:
                    # Sort left-to-right based on bounding box x-min coordinate
                    results_sorted = sorted(results, key=lambda item: item[0][0][0])
                    raw_text = "".join([item[1] for item in results_sorted])
                    confidence = sum([float(item[2]) for item in results_sorted]) / len(results_sorted)
            except Exception as e:
                logger.error(f"Error during EasyOCR extraction: {e}")

        normalized = normalize_plate_number(raw_text)

        return {
            'raw_text': raw_text,
            'normalized_plate': normalized,
            'confidence': round(confidence, 2)
        }
