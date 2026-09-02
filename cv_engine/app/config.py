import re

# Indian License Plate Regex Pattern (e.g. GJ-01-AB-1234, GJ01AB1234, DL3CAB1234, etc.)
INDIAN_PLATE_PATTERN = re.compile(r'^[A-Z]{2}\s*[-. ]?\s*\d{1,2}\s*[-. ]?\s*[A-Z]{1,3}\s*[-. ]?\s*\d{1,4}$')

# Standardize plate string format: GJ01AB1234
def normalize_plate_number(raw_text: str) -> str:
    cleaned = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    
    # Basic correction for common OCR confusions in license plates
    if len(cleaned) >= 8:
        state_part = cleaned[:2].replace('0', 'O').replace('1', 'I')
        cleaned = state_part + cleaned[2:]
    return cleaned

class CVConfig:
    DETECTION_CONFIDENCE_THRESHOLD = 0.35
    FRAME_SAMPLE_RATE = 5  # Process every Nth frame for performance
    OCR_LANGUAGES = ['en']
    DEFAULT_CAMERA_ID = "CAM-AHM-001"
