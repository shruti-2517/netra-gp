# NETRA-GP | Gujarat Police Video Management & ANPR Platform

**Networked Ecosystem for Traffic & Reconnaissance Analytics**  
*Built for the Gujarat Police Innovation Hackathon 2026*

---

## 📌 Project Overview
This repository contains a working prototype of an integrated video management and automated license plate recognition (ANPR) platform. It addresses the challenge of unifying 26 independent, siloed CCTV ecosystems (~80,000 cameras across Gujarat) into a single operational interface.

### Key Architecture: Model 1 + Model 2 Hybrid
- **Model 1 (Registry & GIS Map)**: Centralized database of camera metadata with interactive GIS mapping.
- **Model 2 (Unified Viewing & ANPR Analytics)**: Real-time video ingestion, license plate detection (YOLOv8), OCR text recognition (EasyOCR), watchlist correlation, and automated alert dispatch.
- **Model 4 (Scalability Roadmap)**: Architectural roadmap in the High-Level Design (HLD) detailing evolution to 80,000 cameras.

---

## 📂 Repository Structure

```
gp_hackathon/
├── backend/            # FastAPI application (Camera CRUD, Watchlist DB, Alert WebSocket, Vehicle Tracking)
├── cv_engine/          # Computer Vision engine (OpenCV feed reader, YOLOv8 license plate detector, OCR)
├── frontend/           # GIS Leaflet Dashboard, Live Video Wall, Real-Time Alert Feed & Route Tracing
├── data/               # Seed datasets (sample cameras across Gujarat, watchlist vehicles)
├── docs/               # High-Level Design (HLD) document & Architecture Diagrams
└── docker-compose.yml  # Docker environment (PostgreSQL + PostGIS)
```

---

## 🚀 Quick Start Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose

### 1. Database Infrastructure
```bash
docker-compose up -d
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

## 📄 Deliverables & Docs
- **High-Level Design Document**: Located at [`docs/HLD_ARCHITECTURE.md`](docs/HLD_ARCHITECTURE.md)
