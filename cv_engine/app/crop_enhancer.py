import cv2
import numpy as np

def locate_plate_candidate(vehicle_crop):
    """
    Locates the most probable license plate rectangular contour within a vehicle image crop.
    Focuses on lower bumper area and searches for high vertical edge density rectangular shapes
    with aspect ratio matching Indian license plates (2.2 - 6.0).
    """
    if vehicle_crop is None or vehicle_crop.size == 0:
        return None

    vh, vw = vehicle_crop.shape[:2]
    if vh < 20 or vw < 30:
        return vehicle_crop

    # Focus on lower 60% of vehicle where plates are positioned (bumper/grill area)
    y_start = int(vh * 0.40)
    bumper_crop = vehicle_crop[y_start:vh, :]

    gray = cv2.cvtColor(bumper_crop, cv2.COLOR_BGR2GRAY) if len(bumper_crop.shape) == 3 else bumper_crop.copy()

    # Denoise & Sobel X gradient detection for vertical edge emphasis (plate character patterns)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    sobelx = cv2.Sobel(blurred, cv2.CV_8U, 1, 0, ksize=3)

    # Otsu thresholding
    _, thresh = cv2.threshold(sobelx, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Morphological closing to merge character edges into a solid rectangular block
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (17, 3))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    # Find contours
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    best_crop = None
    max_score = -1.0

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if h == 0 or w == 0:
            continue
        aspect_ratio = w / float(h)
        area = w * h

        # Indian plates have aspect ratio between 1.8 and 6.5, and sufficient area
        if 1.8 <= aspect_ratio <= 6.5 and area > 200 and w > 25 and h > 10:
            score = area * (1.0 - abs(aspect_ratio - 3.8) / 5.0)
            if score > max_score:
                max_score = score
                px = max(0, int(w * 0.05))
                py = max(0, int(h * 0.05))
                x1 = max(0, x - px)
                y1 = max(0, y - py)
                x2 = min(bumper_crop.shape[1], x + w + px)
                y2 = min(bumper_crop.shape[0], y + h + py)
                best_crop = bumper_crop[y1:y2, x1:x2]

    if best_crop is not None and best_crop.size > 0:
        return best_crop

    # Fallback to central bumper crop if contour search yielded no candidate
    fb_y1 = int(vh * 0.50)
    fb_y2 = int(vh * 0.95)
    fb_x1 = int(vw * 0.10)
    fb_x2 = int(vw * 0.90)
    return vehicle_crop[fb_y1:fb_y2, fb_x1:fb_x2]


def enhance_plate_crop(crop):
    """
    Enhances license plate crop using Lanczos/Bicubic upscaling, bilateral denoising,
    and CLAHE contrast enhancement.
    """
    if crop is None or crop.size == 0:
        return None
    h, w = crop.shape[:2]
    if h == 0 or w == 0:
        return None

    # Target width ~ 340px for optimal OCR character segmentation
    scale = max(2.5, 340.0 / float(w))
    new_w = int(w * scale)
    new_h = int(h * scale)

    resized = cv2.resize(crop, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY) if len(resized.shape) == 3 else resized

    # Bilateral filter to reduce compression artifacts while preserving character edges
    denoised = cv2.bilateralFilter(gray, d=7, sigmaColor=75, sigmaSpace=75)

    # Adaptive contrast enhancement (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    return enhanced
