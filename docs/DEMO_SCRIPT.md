# NETRA-GP 2-3 Minute Hackathon Video Demonstration Script

---

## 🎬 Act 1: Executive Overview & Problem Context (0:00 - 0:30)
- **Visual**: Screen recording opens on `http://localhost:5173` showing the dark-mode **GIS Command Map**.
- **Voiceover**: 
  > *"Welcome to NETRA-GP — Gujarat Police's Integrated Video Management and ANPR Platform built for the Innovation Hackathon 2026. Across Gujarat, 26 government departments operate isolated CCTV networks with over 80,000 cameras. NETRA-GP solves this siloed ecosystem using a Model 1 + Model 2 Hybrid Architecture."*

---

## 🗺️ Act 2: Model 1 — GIS Command Map & Spatial Camera Registry (0:30 - 1:00)
- **Visual**: Click quick city focus buttons (**Ahmedabad**, **Gandhinagar**, **Surat**, **Vadodara**, **Rajkot**). Click on camera markers to show interactive popups. Switch to the **Camera Registry** tab.
- **Voiceover**: 
  > *"Under Model 1, our spatial database indexes heterogeneous CCTV feeds across Gujarat. Operators can filter by city or department, view live status, and export full CSV metadata reports with a single click."*

---

## 📹 Act 3: Model 2 — Unified Video Wall & ANPR Analytics Engine (1:00 - 1:40)
- **Visual**: Switch to **Live Video Wall** tab. Show the 4-camera grid with bounding box vehicle detections and live ANPR plate tickers below each feed.
- **Voiceover**: 
  > *"Model 2 powers our unified viewing layer. Streams are ingested in parallel using OpenCV and FFmpeg, fed into YOLOv8 for vehicle plate detection, and read via EasyOCR with regex normalization for Indian plate formats."*

---

## 🚨 Act 4: Watchlist Correlation & Real-Time Alerting (1:40 - 2:10)
- **Visual**: Open **Watchlist DB** tab, show stolen vehicle entry `GJ01AB1234`. Point to the right-side **Real-Time Alert Feed** receiving WebSocket alerts.
- **Voiceover**: 
  > *"Incoming plate reads are cross-referenced in real-time against our Watchlist Correlation Engine. Exact, canonical, and Levenshtein fuzzy distance matching flag hotlist vehicles instantly, broadcasting real-time alerts with threat classifications directly to the command center."*

---

## 🔍 Act 5: Vehicle Journey Route Reconstruction & Conclusion (2:10 - 2:30)
- **Visual**: Open **Vehicle Route Trace** tab. Search plate `GJ01AB1234`. Show the step-by-step movement timeline and animated GIS map polyline connecting Ahmedabad → Gandhinagar → Vadodara.
- **Voiceover**: 
  > *"Finally, commanders can reconstruct a target vehicle's spatial movement trajectory across Gujarat. Combined with our HLD roadmap scaling to 80,000 cameras via Kafka and GPU clusters, NETRA-GP delivers an operational, end-to-end ANPR solution for Gujarat Police."*
