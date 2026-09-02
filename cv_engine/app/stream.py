import cv2
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VideoStreamReader")

class VideoStreamReader:
    def __init__(self, source, frame_sample_rate=5):
        """
        source: RTSP URL, HTTP URL, or local file path
        frame_sample_rate: process 1 frame every N frames
        """
        self.source = source
        self.frame_sample_rate = frame_sample_rate
        self.cap = None

    def connect(self):
        logger.info(f"Connecting to video feed source: {self.source}")
        self.cap = cv2.VideoCapture(self.source)
        if not self.cap.isOpened():
            logger.error(f"Failed to open video source: {self.source}")
            return False
        logger.info(f"Successfully connected to feed: {self.source}")
        return True

    def read_frames(self):
        if not self.cap or not self.cap.isOpened():
            if not self.connect():
                return

        frame_count = 0
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                logger.info("End of video stream or feed disconnected.")
                break

            frame_count += 1
            if frame_count % self.frame_sample_rate == 0:
                timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                yield frame_count, timestamp, frame

        self.release()

    def release(self):
        if self.cap:
            self.cap.release()
            logger.info("Video stream source released.")
