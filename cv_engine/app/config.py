import re

# Indian License Plate Regex Pattern (e.g. GJ-01-AB-1234, GJ01AB1234, DL3CAB1234, etc.)
INDIAN_PLATE_PATTERN = re.compile(r'^[A-Z]{2}\s*[-. ]?\s*\d{1,2}\s*[-. ]?\s*[A-Z]{1,3}\s*[-. ]?\s*\d{1,4}$')

# Standardize plate string format: GJ01AB1234
def normalize_plate_number(raw_text: str) -> str:
    cleaned = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    
    if len(cleaned) >= 6:
        # First 2 chars: State letters (e.g. GJ, DL, TN, MH) -> Replace numbers with letters
        state_part = cleaned[:2].replace('0', 'O').replace('1', 'I').replace('8', 'B')
        
        # Next 2 chars: RTO District code -> Replace letters with numbers (e.g. O1 -> 01, O5 -> 05)
        dist_part = cleaned[2:4].replace('O', '0').replace('Q', '0').replace('D', '0').replace('I', '1').replace('L', '1').replace('Z', '2').replace('S', '5').replace('B', '8')
        
        rest = cleaned[4:]
        cleaned = state_part + dist_part + rest
        
    return cleaned

class CVConfig:
    DETECTION_CONFIDENCE_THRESHOLD = 0.35
    FRAME_SAMPLE_RATE = 5  # Process every Nth frame for performance
    OCR_LANGUAGES = ['en']
    DEFAULT_CAMERA_ID = "CAM-AHM-001"
