"""
NETRA-GP Dynamic Camera Catalogue Ingestion Service
Integrates with the live Gateway Catalogue API (http://<host>/api/ingest)
as per the Official Camera Grid Integration Specification.
"""
import os
import logging
import requests
import json

logger = logging.getLogger("CatalogueIngestion")

DEFAULT_INGEST_URL = os.environ.get("INGEST_URL", "http://localhost:8000/api/ingest")

class CatalogueService:
    def __init__(self, ingest_url=DEFAULT_INGEST_URL):
        self.ingest_url = ingest_url

    def fetch_catalogue(self):
        """
        Fetches live camera inventory from dynamic API contract or Sentinel CDN catalogue (https://cctv.corp8.cloud/cameras.json).
        Returns list of 30 cameras with id, location, codec, live status, and endpoints (RTSP, WebRTC/WHEP, HLS).
        """
        # 1. Primary Attempt: Sentinel CDN Catalogue
        sentinel_url = "https://cctv.corp8.cloud/cameras.json"
        try:
            resp = requests.get(sentinel_url, timeout=3.0)
            if resp.status_code == 200 and len(resp.json()) > 0:
                cameras = resp.json()
                logger.info(f"Successfully retrieved {len(cameras)} cameras from Sentinel CDN catalogue.")
                return cameras
        except Exception:
            pass

        # 2. Secondary Attempt: Local API Ingestion
        logger.info(f"Fetching dynamic camera catalogue from: {self.ingest_url}")
        try:
            resp = requests.get(self.ingest_url, timeout=3.0)
            if resp.status_code == 200:
                cameras = resp.json()
                logger.info(f"Successfully retrieved {len(cameras)} cameras from dynamic catalogue API.")
                return cameras
        except Exception as e:
            logger.warning(f"Could not reach dynamic catalogue API ({e}). Falling back to local dataset inventory.")

        # 3. Fallback to 30-camera local dataset inventory
        fallback_path = os.path.join("data", "sentinel_live_cameras.json")
        if os.path.exists(fallback_path):
            with open(fallback_path, "r", encoding="utf-8") as f:
                cameras = json.load(f)
                logger.info(f"Loaded {len(cameras)} cameras from fallback registry: {fallback_path}")
                return cameras

        return []

    def get_stream_url(self, camera_id, protocol="rtsp"):
        """
        Resolves stream URL for a given camera_id and protocol preference ('rtsp', 'whep', 'hls').
        """
        catalogue = self.fetch_catalogue()
        for cam in catalogue:
            if cam.get("camera_id") == camera_id or cam.get("id") == camera_id:
                # Check explicit endpoint dict or stream_url
                endpoints = cam.get("endpoints", {})
                if protocol in endpoints:
                    return endpoints[protocol]
                return cam.get("stream_url", "")
        return None
