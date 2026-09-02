"""
Official Ultralytics YOLOv8 Weights Auto-Downloader
Instantiates ultralytics YOLO to download official pre-trained YOLOv8 model weights directly.
"""
from ultralytics import YOLO
import os

def main():
    print("Downloading official pre-trained YOLOv8 weights via Ultralytics API...")
    # Instantiating YOLO with 'yolov8n.pt' automatically fetches the official pre-trained weights from GitHub releases
    model = YOLO('yolov8n.pt')
    
    # Save a copy explicitly to cv_engine/yolov8n.pt for local pipeline reference
    weights_path = "cv_engine/yolov8n.pt"
    model.save(weights_path)
    print(f"✅ Pre-trained YOLOv8 weights ready at: {weights_path}")

if __name__ == "__main__":
    main()
