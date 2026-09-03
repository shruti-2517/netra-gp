import os
import cv2
import time
import logging
import platform

# Force RTSP over TCP for network streams
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VideoStreamReader")

class VideoStreamReader:
    def __init__(self, source, frame_sample_rate=2):
        """
        source: RTSP URL, WebRTC/WHEP, HLS URL, local file path, or webcam index (0)
        frame_sample_rate: process 1 frame every N frames
        """
        self.source = source
        self.frame_sample_rate = frame_sample_rate
        self.cap = None
        self.is_webcam = isinstance(source, int) or (isinstance(source, str) and source.isdigit())

    def connect(self, retry_backoff=2.0, max_backoff=30.0):
        """
        Connects to video feed with automatic backend selection:
        - Webcam index (0): DirectShow / default capture
        - RTSP/Network: FFMPEG with TCP
        - Local file: Default file reader
        """
        current_backoff = retry_backoff
        src_target = int(self.source) if self.is_webcam else self.source

        while True:
            logger.info(f"Connecting to feed source: {self.source} (Webcam Mode: {self.is_webcam})...")
            
            if self.is_webcam:
                # On Windows, DirectShow backend (CAP_DSHOW) or MSMF is required for webcam
                if platform.system() == "Windows":
                    self.cap = cv2.VideoCapture(src_target, cv2.CAP_DSHOW)
                    if not self.cap.isOpened():
                        self.cap = cv2.VideoCapture(src_target)
                else:
                    self.cap = cv2.VideoCapture(src_target)
            elif isinstance(src_target, str) and src_target.startswith(("rtsp://", "http://", "https://")):
                self.cap = cv2.VideoCapture(src_target, cv2.CAP_FFMPEG)
            else:
                self.cap = cv2.VideoCapture(src_target)
            
            if self.cap and self.cap.isOpened():
                logger.info(f"Successfully connected to feed: {self.source}")
                return True
                
            logger.warning(f"Connection failed to {self.source}. Reconnecting in {current_backoff:.1f}s (exponential backoff)...")
            time.sleep(current_backoff)
            current_backoff = min(current_backoff * 2.0, max_backoff)

    def read_frames(self):
        if not self.cap or not self.cap.isOpened():
            if not self.connect():
                return

        frame_count = 0
        last_pts = -1

        while True:
            if not self.cap or not self.cap.isOpened():
                logger.warning("Stream disconnected. Attempting automatic reconnect with backoff...")
                if not self.connect():
                    break

            ret, frame = self.cap.read()
            if not ret:
                logger.info("End of feed or temporary stream interruption detected.")
                self.release()
                time.sleep(1.0)
                if not self.connect(retry_backoff=1.0):
                    break
                continue

            pts_ms = self.cap.get(cv2.CAP_PROP_POS_MSEC)
            
            # Scene Discontinuity Detection
            if pts_ms < last_pts and pts_ms > 0:
                logger.info(f"Scene Discontinuity / Loop Cut detected. Resetting track state.")
            last_pts = pts_ms

            frame_count += 1
            if frame_count % self.frame_sample_rate == 0:
                timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                yield frame_count, pts_ms, timestamp, frame
                
            # Real-time stream pacing for file playback
            if not self.is_webcam and isinstance(self.source, str) and not self.source.startswith("rtsp://"):
                time.sleep(0.02) # Paced 30-50 FPS playback

        self.release()

    def release(self):
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            logger.info("Video stream source released.")
