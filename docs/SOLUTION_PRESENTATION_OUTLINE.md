# NETRA-GP Solution Presentation Outline
## Gujarat Police Innovation Hackathon 2026

---

## Slide 1: Title & Executive Summary
- **Project Name**: NETRA-GP (Networked Ecosystem for Traffic & Reconnaissance Analytics)
- **Tagline**: Integrated Video Management & Automated License Plate Recognition (ANPR) Platform
- **Context**: Solves the challenge of 26 siloed government CCTV networks (~80,000 cameras) across Gujarat State.

---

## Slide 2: Problem Statement & Key Challenges
1. **Siloed Infrastructure**: 26 independent CCTV networks running isolated VMS platforms and diverse retention policies.
2. **Manual Surveillance Overhead**: Inability to cross-reference stolen/wanted vehicles state-wide in real-time.
3. **Lack of Central Spatial Visibility**: No unified GIS map showing live camera status and alert hotspots across cities.

---

## Slide 3: Proposed Hybrid Architecture (Model 1 + Model 2)
- **Model 1 (Metadata Registry & GIS Map)**: Centralized PostGIS database indexing heterogeneous CCTV metadata with interactive Leaflet GIS visualization.
- **Model 2 (Unified Viewing & ANPR Analytics Engine)**: Edge-friendly video stream ingestion (OpenCV/FFmpeg), YOLOv8 license plate detection, and EasyOCR text extraction.
- **Real-Time Watchlist Correlation**: Low-latency matching engine (exact + canonical + Levenshtein fuzzy distance) triggering instant WebSocket alerts.

---

## Slide 4: Key Platform Features & Deliverables
1. 🗺️ **GIS Command Map**: Interactive dark-mode state map displaying cameras across Gujarat (Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot) with live alert hotspots.
2. 📹 **Multi-Feed Live Video Wall**: Real-time parallel stream viewing with YOLOv8 bounding box overlays and live ANPR tickers.
3. 📋 **Camera Metadata Registry**: Centralized inventory with CSV bulk import and city/department filters.
4. 🚨 **Watchlist Hotlist Database**: Threat classification (`CRITICAL`, `HIGH`, `MEDIUM`) with instant WebSocket alert dispatch.
5. 🔍 **Vehicle Journey Route Tracer**: Chronological spatial timeline reconstructing vehicle movement history across Gujarat cameras with map polylines.
6. 📊 **Automated Audit & Report Export**: Instant downloadable CSV/Markdown reports for law enforcement audit trails.

---

## Slide 5: Model 4 Scalability Roadmap (~80,000 Cameras)
1. **Distributed Stream Ingestion**: Apache Kafka cluster partitioned by district/zone.
2. **GPU Analytics Cluster**: Kubernetes-managed GPU worker pools (NVIDIA Triton Inference Server).
3. **Multi-Tiered Storage**: Hot S3 Object Storage for recent clips + Cold Tape Storage for long-term retention.
4. **Security & Governance**: OAuth2 / OIDC authentication with fine-grained department-level RBAC.

---

## Slide 6: Live Prototype Demonstration & Conclusion
- Prototype URL: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`
- **Summary**: Delivered a fully functional, end-to-end working prototype meeting all hackathon requirements.
