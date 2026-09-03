"""
Generate realistic synthetic video feeds containing vehicles and Indian license plates
for out-of-the-box ANPR testing in NETRA-GP.
"""
import os
import cv2
import numpy as np

def generate_sample_traffic_video(output_path="data/sample_feeds/traffic1.mp4", num_frames=180, fps=30):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    width, height = 1280, 720
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Plates to animate through the camera frame
    test_plates = [
        {"plate": "GJ01AB1234", "color": (40, 40, 180), "label": "SEDAN (RED)"},
        {"plate": "GJ05CD5678", "color": (180, 180, 180), "label": "SUV (SILVER)"},
        {"plate": "GJ18EF9012", "color": (30, 140, 30), "label": "BUS (GREEN)"}
    ]
    
    print(f"Generating test traffic video feed at: {output_path} ({num_frames} frames)...")

    for i in range(num_frames):
        # Road background (dark asphalt with dashed white lines)
        frame = np.full((height, width, 3), (45, 45, 45), dtype=np.uint8)
        
        # Road markings
        cv2.line(frame, (0, 360), (width, 360), (70, 70, 70), 3)
        dash_offset = (i * 12) % 100
        for x in range(-100 + dash_offset, width + 100, 80):
            cv2.line(frame, (x, 360), (x + 40, 360), (220, 220, 220), 4)

        # Draw timestamp header
        cv2.putText(frame, f"CAM-AHM-001 | ISCON CROSSROAD AHMEDABAD | LIVE FEED", (30, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        cv2.putText(frame, f"FRAME: {i:04d} | PTS: {int(i * (1000/fps))} ms", (30, 75),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

        # Animate vehicles
        plate_idx = (i // 60) % len(test_plates)
        target = test_plates[plate_idx]
        progress = (i % 60) / 60.0
        
        # Vehicle motion from right to left
        car_x = int(width - (progress * (width + 400)))
        car_y = 420
        car_w = 340
        car_h = 170

        if -400 < car_x < width + 100:
            # Car body
            cv2.rectangle(frame, (car_x, car_y), (car_x + car_w, car_y + car_h), target["color"], -1)
            cv2.rectangle(frame, (car_x, car_y), (car_x + car_w, car_y + car_h), (20, 20, 20), 3)
            
            # Car windshield
            cv2.rectangle(frame, (car_x + 40, car_y - 50), (car_x + car_w - 40, car_y), (60, 60, 80), -1)

            # License Plate Area (White rectangular plate with black border)
            pw, ph = 200, 55
            px = car_x + (car_w - pw) // 2
            py = car_y + car_h - ph - 15
            
            cv2.rectangle(frame, (px, py), (px + pw, py + ph), (255, 255, 255), -1)
            cv2.rectangle(frame, (px, py), (px + pw, py + ph), (0, 0, 0), 2)
            
            # IND Blue Strip on the left of the plate
            cv2.rectangle(frame, (px, py), (px + 20, py + ph), (200, 80, 20), -1)
            cv2.putText(frame, "IND", (px + 2, py + 32), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1)

            # Registration Number text
            plate_text = target["plate"]
            cv2.putText(frame, plate_text, (px + 28, py + 38),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.85, (0, 0, 0), 2, cv2.LINE_AA)

        out.write(frame)

    out.release()
    print(f"Successfully generated sample traffic video feed: {output_path}")

if __name__ == "__main__":
    generate_sample_traffic_video()
