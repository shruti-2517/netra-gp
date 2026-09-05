# NETRA-GP | Gujarat Police Video Management & ANPR Platform

**Networked Ecosystem for Traffic & Reconnaissance Analytics**  
*Built for the Gujarat Police Innovation Hackathon 2026*

---

## 📌 Project Overview
This repository contains a working prototype of an integrated video management and automated license plate recognition (ANPR) platform. It addresses the challenge of unifying 26 independent, siloed CCTV ecosystems (~80,000 cameras across Gujarat) into a single operational interface.

### Key Architecture
- **Model 1 (Registry & GIS Map)**: Centralized database of camera metadata with interactive GIS spatial mapping (PostGIS + Leaflet).
- **Model 2 (Unified Viewing & ANPR Analytics)**: Real-time live RTSP stream ingestion, license plate detection (YOLOv8), multi-pass OCR (EasyOCR + CLAHE + Otsu), strict Indian state code & HSRP length normalization (7–10 characters, e.g. `GJ01HY5842`, `TN87C5106`, `MH02BZ1234`, `DL7CQ1939`), watchlist correlation, and Section 63 BSA 2023 digital evidence certificate vault.
- **Dual Speed Calculation & Enforcement Engine**:
  - **Multi-Camera (Section Speed Control)**: Calculates exact Haversine GPS distance ($\Delta d$ in km) over time deltas ($\Delta t$ in hours) across highway checkpoints to issue court-admissible `INTER_CAMERA_SPEED_VIOLATION` tickets.
  - **Single-Camera (Optical Velocity Tracking)**: Estimates 2D bounding box centroid motion ($\Delta p / H_{\text{box}}$) with focal perspective calibration (`SpeedCalculator.estimate_optical_velocity`), calibrated against realistic traffic flows (15–78 km/h compliant, >80 km/h overspeeding) to eliminate false alert spamming.
- **Model 4 (Distributed Microservices)**: Architecture bridging PostgreSQL, Kafka, MinIO, and scalable standalone CV workers.
- **Decoupled Analytics via Kafka**: Stream ingestion and ANPR workloads are decoupled using a pub/sub event-driven architecture (`netra.streams.ingest`), enabling horizontal scaling of YOLOv8/EasyOCR pipelines.
- **Resilient Cloud Storage (S3/MinIO)**: Violation evidence clips and BSA 2023 compliant certificates are persisted securely via S3-compatible resilient object storage.
- **Role-Based Access Control (RBAC)**: Secure multi-tenant access utilizing JWT authentication with strict, cryptographically enforced department-level camera isolation.
- **PTS-Based Timing & Motion Engine**: Driven strictly by Presentation Timestamps (`CAP_PROP_POS_MSEC`), eliminating initial GOP replay velocity spikes and handling variable frame rates.
- **Resilient Stream Ingestion**: Supervised RTSP reader with automatic reconnection and exponential backoff (2s to 30s cap).
- **100% Genuine Live Feed Telemetry & Reports**: Validation reports (`data/reports/`) built from genuine live Sentinel RTSP feeds (`rtsp://103.250.160.189:8554/stream/{camera_id}`) with zero synthetic fallbacks.

---

## 📂 Repository Structure

```
gp_hackathon/
├── backend/            # FastAPI application (Camera CRUD, Watchlist DB, Alert WebSocket, Vehicle Tracking)
├── cv_engine/          # Computer Vision engine (OpenCV feed reader, YOLOv8 license plate detector, OCR)
├── frontend/           # GIS Leaflet Dashboard, Live Video Wall, Real-Time Alert Feed & Route Tracing
├── data/               # Seed datasets (sample cameras across Gujarat, watchlist vehicles)
└── docs/               # High-Level Design (HLD) document & Architecture Diagrams
```

---

## 🚀 Quick Start Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database

### 1. Database Infrastructure Setup
Ensure PostgreSQL service is running locally on port 5432.
Run the automated setup script to create the `gujarat_cctv_db` database and `cctv_admin` user:
```bash
cd backend
python setup_postgres.py
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

### 3. CV Engine Setup
```bash
cd cv_engine
pip install -r requirements.txt
python main.py
```

---

- **3rd-Party Evaluation & Testing Guide**: Located at [`EVALUATION_GUIDE.md`](EVALUATION_GUIDE.md)
- **High-Level Design Document**: Located at [`docs/HLD_ARCHITECTURE.md`](docs/HLD_ARCHITECTURE.md)
- **Demo Script**: Located at [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)
