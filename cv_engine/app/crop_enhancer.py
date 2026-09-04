import cv2
import numpy as np

def enhance_plate_crop(crop):
    if crop is None or crop.size == 0:
        return None
    h, w = crop.shape[:2]
    if h == 0 or w == 0:
        return None
        
    # Fast 3x bicubic upscaling
    resized = cv2.resize(crop, (w * 3, h * 3), interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY) if len(resized.shape) == 3 else resized
    
    # Fast CLAHE contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    
    return enhanced
