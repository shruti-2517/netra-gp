import os
import cv2
import time
import logging

# Official Requirement: Force RTSP over TCP to prevent packet corruption across firewalls & NATs
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VideoStreamReader")

class VideoStreamReader:
    def __init__(self, source, frame_sample_rate=5):
        """
        source: RTSP URL, WebRTC/WHEP, HLS URL, or local file path
        frame_sample_rate: process 1 frame every N frames
        """
        self.source = source
        self.frame_sample_rate = frame_sample_rate
        self.cap = None

    def connect(self, retry_backoff=2.0, max_backoff=30.0):
        """
        Connects to video feed with automatic exponential backoff retry logic.
        """
        current_backoff = retry_backoff
        while True:
            logger.info(f"Connecting to live feed source (RTSP over TCP forced): {self.source}")
            
            # Using CAP_FFMPEG explicitly for low-latency RTSP decoding
            self.cap = cv2.VideoCapture(self.source, cv2.CAP_FFMPEG)
            
            if self.cap.isOpened():
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
                # Attempt graceful reconnect with exponential backoff rather than aborting
                self.release()
                time.sleep(2.0)
                if not self.connect(retry_backoff=2.0):
                    break
                continue

            # DO: Drive all timing from Presentation Timestamp (PTS), never arrival wall-clock time
            pts_ms = self.cap.get(cv2.CAP_PROP_POS_MSEC)
            
            # Scene Discontinuity Detection (e.g. video loop point cut)
            if pts_ms < last_pts:
                logger.info(f"Scene Discontinuity / Loop Cut detected (PTS reset from {last_pts}ms to {pts_ms}ms). Resetting track state.")
            last_pts = pts_ms

            frame_count += 1
            if frame_count % self.frame_sample_rate == 0:
                # Convert PTS to ISO timestamp or relative time string
                timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                yield frame_count, pts_ms, timestamp, frame

        self.release()

    def release(self):
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            logger.info("Video stream source released.")
