import re

# Comprehensive Indian State & Union Territory Registration Codes (plus BH Bharat Series)
INDIAN_STATE_CODES = {
    "AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DN", "DL", 
    "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "LA", "LD", 
    "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "OR", "PB", "PY", 
    "RJ", "SK", "TN", "TS", "TR", "UP", "UK", "UA", "WB", "BH"
}

# Indian License Plate Regex Pattern (e.g. GJ01AB1234, DL03CB1234, 22BH1234AA, etc.)
INDIAN_PLATE_PATTERN = re.compile(r'^[A-Z0-9]{2}\s*[-. ]?\s*\d{1,2}\s*[-. ]?\s*[A-Z]{1,3}\s*[-. ]?\s*\d{1,4}$')

def normalize_plate_number(raw_text: str) -> str:
    if not raw_text:
        return ""
    cleaned = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    
    if len(cleaned) >= 4:
        p2 = cleaned[:2]
        common_map = {
            '16': 'GJ', '1I': 'GJ', 'G1': 'GJ', 'G6': 'GJ', '0J': 'GJ', 
            'OJ': 'GJ', 'CJ': 'GJ', 'CI': 'GJ', '6J': 'GJ', 'G7': 'GJ', 'C7': 'GJ'
        }
        if p2 in common_map:
            cleaned = common_map[p2] + cleaned[2:]
        elif p2.replace('0','O').replace('1','I') in INDIAN_STATE_CODES:
            cleaned = p2.replace('0','O').replace('1','I') + cleaned[2:]
        elif not (p2[0].isalpha() and p2[1].isalpha()):
            cleaned = 'GJ' + cleaned[2:]
        
        # Correct RTO district digits (chars 2..4)
        if len(cleaned) >= 4:
            d_map = {'O':'0','Q':'0','D':'0','I':'1','L':'1','Z':'2','E':'3','A':'4','S':'5','G':'6','T':'7','B':'8'}
            d1 = d_map.get(cleaned[2], cleaned[2])
            d2 = d_map.get(cleaned[3], cleaned[3])
            cleaned = cleaned[:2] + d1 + d2 + cleaned[4:]
            
        # Correct trailing numerical sequence (chars 6+)
        if len(cleaned) >= 7:
            n_map = {'O':'0','Q':'0','D':'0','I':'1','L':'1','Z':'2','E':'3','A':'4','S':'5','G':'6','T':'7','B':'8'}
            num_corr = ''.join([n_map.get(c, c) for c in cleaned[6:]])
            cleaned = cleaned[:6] + num_corr

    return cleaned

class CVConfig:
    DETECTION_CONFIDENCE_THRESHOLD = 0.35
    FRAME_SAMPLE_RATE = 5  # Process every Nth frame for performance
    OCR_LANGUAGES = ['en']
    DEFAULT_CAMERA_ID = "CAM-AHM-001"
