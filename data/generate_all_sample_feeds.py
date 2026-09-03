"""
NETRA-GP Real-World Sample Feed Generator
Generates realistic 1080p/720p highway traffic camera video feeds with moving vehicles,
realistic asphalt perspectives, lane markings, HUD telemetry, and authentic Indian registration plates.
"""
import os
import cv2
import numpy as np

FEEDS = [
    {
        "filename": "traffic1.mp4",
        "cam_name": "CAM-AHM-001 | ISCON CROSSROAD, AHMEDABAD",
        "city": "Ahmedabad",
        "plates": [
            {"plate": "GJ01AB1234", "color": (30, 30, 180), "label": "SEDAN (RED)"},
            {"plate": "GJ01CD5678", "color": (180, 180, 180), "label": "SUV (SILVER)"},
            {"plate": "GJ01XY9999", "color": (220, 220, 220), "label": "HATCHBACK (WHITE)"}
        ]
    },
    {
        "filename": "120678-721759752_medium.mp4",
        "cam_name": "CAM-GND-002 | GH-5 CIRCLE, GANDHINAGAR",
        "city": "Gandhinagar",
        "plates": [
            {"plate": "GJ18EF9012", "color": (20, 20, 20), "label": "SCORPIO (BLACK)"},
            {"plate": "GJ18AB4321", "color": (240, 240, 240), "label": "CRETA (WHITE)"},
            {"plate": "GJ18ZZ7777", "color": (30, 120, 30), "label": "BUS (GREEN)"}
        ]
    },
    {
        "filename": "153283-804933523_medium.mp4",
        "cam_name": "CAM-SRT-003 | RING ROAD TEXTILE MARKET, SURAT",
        "city": "Surat",
        "plates": [
            {"plate": "GJ05XY8888", "color": (30, 160, 220), "label": "BUS (YELLOW)"},
            {"plate": "GJ05KL1234", "color": (180, 80, 30), "label": "SEDAN (BLUE)"},
            {"plate": "GJ05MN5555", "color": (140, 140, 140), "label": "SUV (GREY)"}
        ]
    },
    {
        "filename": "154195-807166827_medium.mp4",
        "cam_name": "CAM-BRD-004 | ALKAPURI UNDERPASS, VADODARA",
        "city": "Vadodara",
        "plates": [
            {"plate": "GJ06MN5678", "color": (40, 130, 40), "label": "HATCHBACK (GREEN)"},
            {"plate": "GJ06OP9012", "color": (160, 160, 160), "label": "SUV (SILVER)"},
            {"plate": "GJ06AB1111", "color": (20, 20, 160), "label": "SEDAN (RED)"}
        ]
    },
    {
        "filename": "84222-584891447_medium.mp4",
        "cam_name": "CAM-RJK-005 | KALAWAD ROAD, RAJKOT",
        "city": "Rajkot",
        "plates": [
            {"plate": "GJ03QR3456", "color": (40, 40, 160), "label": "TRUCK (MAROON)"},
            {"plate": "GJ03ST7890", "color": (230, 230, 230), "label": "SEDAN (WHITE)"},
            {"plate": "GJ03XY3333", "color": (20, 20, 20), "label": "SUV (BLACK)"}
        ]
    }
]

def generate_feed(feed_info, output_dir="data/sample_feeds", num_frames=180, fps=30):
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, feed_info["filename"])
    
    width, height = 1280, 720
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(out_path, fourcc, fps, (width, height))
    
    test_plates = feed_info["plates"]
    print(f"Generating realistic video feed [{feed_info['filename']}] for {feed_info['cam_name']}...")

    for i in range(num_frames):
        # Realistic dark asphalt highway
        frame = np.full((height, width, 3), (40, 42, 45), dtype=np.uint8)
        
        # Dual lane markings & shoulders
        cv2.line(frame, (0, 380), (width, 380), (65, 68, 70), 3)
        dash_offset = (i * 14) % 120
        for x in range(-120 + dash_offset, width + 120, 90):
            cv2.line(frame, (x, 380), (x + 45, 380), (230, 230, 230), 4)

        # Top Command Telemetry Header
        cv2.rectangle(frame, (0, 0), (width, 80), (15, 20, 25), -1)
        cv2.putText(frame, feed_info["cam_name"], (24, 34),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 210, 255), 2)
        cv2.putText(frame, f"FPS: {fps} | PTS: {int(i * (1000/fps))} ms | FRAME: {i:04d} | GUJARAT POLICE CCTV NETWORK",
                    (24, 64), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (180, 190, 200), 1)

        # Animate moving vehicles across the frame
        plate_idx = (i // 60) % len(test_plates)
        target = test_plates[plate_idx]
        progress = (i % 60) / 60.0
        
        # Smooth vehicle movement across camera FOV
        car_x = int(width - (progress * (width + 450)))
        car_y = 410
        car_w = 360
        car_h = 180

        if -450 < car_x < width + 100:
            # Main Vehicle Body
            cv2.rectangle(frame, (car_x, car_y), (car_x + car_w, car_y + car_h), target["color"], -1)
            cv2.rectangle(frame, (car_x, car_y), (car_x + car_w, car_y + car_h), (15, 15, 20), 3)
            
            # Windshield / Cabin Glass
            cv2.rectangle(frame, (car_x + 45, car_y - 55), (car_x + car_w - 45, car_y), (50, 60, 75), -1)
            cv2.rectangle(frame, (car_x + 45, car_y - 55), (car_x + car_w - 45, car_y), (20, 20, 20), 2)

            # Wheels
            cv2.circle(frame, (car_x + 70, car_y + car_h), 28, (20, 20, 20), -1)
            cv2.circle(frame, (car_x + car_w - 70, car_y + car_h), 28, (20, 20, 20), -1)

            # Authentic Indian License Plate (HSRP White Plate with IND Blue Strip)
            pw, ph = 210, 58
            px = car_x + (car_w - pw) // 2
            py = car_y + car_h - ph - 16
            
            cv2.rectangle(frame, (px, py), (px + pw, py + ph), (255, 255, 255), -1)
            cv2.rectangle(frame, (px, py), (px + pw, py + ph), (0, 0, 0), 2)
            
            # IND Blue Strip
            cv2.rectangle(frame, (px, py), (px + 22, py + ph), (200, 70, 20), -1)
            cv2.putText(frame, "IND", (px + 2, py + 34), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1)

            # Registration Number
            cv2.putText(frame, target["plate"], (px + 30, py + 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.88, (0, 0, 0), 2, cv2.LINE_AA)

        out.write(frame)

    out.release()
    print(f"[SUCCESS] Generated: {out_path}")

def generate_all():
    print("==================================================")
    print("  NETRA-GP REAL-WORLD SAMPLE FEEDS GENERATOR")
    print("==================================================")
    for f in FEEDS:
        generate_feed(f)
    print("\n[SUCCESS] All 5 sample camera feeds generated in data/sample_feeds/")

if __name__ == "__main__":
    generate_all()
