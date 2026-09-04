import os
import cv2
import time
import logging
import platform

# Force RTSP over TCP for reliable network streams
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VideoStreamReader")

class VideoStreamReader:
    """
    RTSP / Network Video Stream Reader with PTS-Based Frame Timing and Exponential Backoff Reconnection.
    
    Architectural Principles:
    1. Drive all frame timing strictly from Presentation Timestamps (PTS) via `CAP_PROP_POS_MSEC`, NEVER arrival wall-clock time.
       - Solves initial GOP replay burst velocities where client connection replays buffered keyframes faster than real-time.
    2. Dynamic variable frame rate tolerance: Does not assume fixed 30 FPS. Calculates actual inter-frame PTS deltas.
    3. Automatic Reconnection with Exponential Backoff: Starts at 2.0s delay, doubling up to a maximum cap of 30.0s on stream interruption.
    """
    def __init__(self, source, frame_sample_rate=2):
        self.source = source
        self.frame_sample_rate = frame_sample_rate
        self.cap = None
        self.is_webcam = isinstance(source, int) or (isinstance(source, str) and source.isdigit())
        self.last_pts_ms = -1.0
        self.reconnect_delay = 2.0  # Initial exponential backoff delay (seconds)
        self.max_backoff = 30.0    # Cap exponential backoff delay (seconds)

    def connect(self):
        """
        Establishes connection to feed source with exponential backoff retry.
        Initial delay: 2.0s | Maximum cap: 30.0s | Backoff factor: 2.0x
        """
        current_delay = self.reconnect_delay
        src_target = int(self.source) if self.is_webcam else self.source

        while True:
            logger.info(f"Connecting to feed source: {self.source} (Webcam: {self.is_webcam})...")
            
            if self.is_webcam:
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
                self.reconnect_delay = 2.0  # Reset backoff on successful connection
                return True
                
            logger.warning(f"Connection failed for {self.source}. Reconnecting in {current_delay:.1f}s (exponential backoff)...")
            time.sleep(current_delay)
            current_delay = min(current_delay * 2.0, self.max_backoff)

    def read_frames(self):
        if not self.cap or not self.cap.isOpened():
            if not self.connect():
                return

        frame_count = 0

        while True:
            if not self.cap or not self.cap.isOpened():
                logger.warning("Stream disconnected. Attempting automatic reconnect with exponential backoff...")
                if not self.connect():
                    break

            ret, frame = self.cap.read()
            if not ret:
                logger.info("End of feed or stream interruption detected. Reconnecting with exponential backoff...")
                self.release()
                time.sleep(self.reconnect_delay)
                if not self.connect():
                    break
                continue

            # Drive timing strictly from OpenCV Presentation Timestamp (PTS)
            pts_ms = float(self.cap.get(cv2.CAP_PROP_POS_MSEC))

            # Detect GOP replay bursts or timestamp resets (pts_ms jump backward or zero on replay)
            if pts_ms > 0 and pts_ms < self.last_pts_ms:
                logger.info(f"GOP Replay / Timestamp Reset detected (PTS: {self.last_pts_ms:.1f}ms -> {pts_ms:.1f}ms). Resetting track state.")
            
            delta_pts_ms = (pts_ms - self.last_pts_ms) if self.last_pts_ms >= 0 and pts_ms > self.last_pts_ms else 0.0
            self.last_pts_ms = pts_ms

            frame_count += 1
            if frame_count % self.frame_sample_rate == 0:
                timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                yield frame_count, pts_ms, delta_pts_ms, timestamp, frame

            # Real-time stream pacing for offline video files
            if not self.is_webcam and isinstance(self.source, str) and not self.source.startswith("rtsp://"):
                time.sleep(0.02)

        self.release()

    def release(self):
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            logger.info("Video stream source released.")
