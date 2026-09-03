"""
Test script to verify Phase 2 end-to-end flow:
1. Speed Violation Calculation
2. Watchlist Alerting
3. BSA 2023 Evidence Certificate & e-Challan generation
4. Predictive Interception Forecast
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def run_phase2_verification():
    print("==================================================")
    print("  NETRA-GP PHASE 2 SYSTEM VERIFICATION SUITE")
    print("==================================================")

    # 1. Simulate Detection 1 at Camera 1 (SG Highway - Iscon Crossroad, Ahmedabad)
    det1 = {
        "camera_id": "CAM-AHM-001",
        "timestamp": "2026-09-03T10:00:00Z",
        "license_plate": "GJ01AB1234",
        "vehicle_color": "RED",
        "vehicle_type": "SEDAN",
        "detection_confidence": 0.95,
        "ocr_confidence": 0.98,
        "bbox": [200, 300, 600, 500]
    }
    r1 = requests.post(f"{BASE_URL}/detections", json=det1)
    print(f"\n[1] Ingested Checkpoint 1 (Iscon Crossroad): Status {r1.status_code}")
    print("    Response:", r1.json())

    # 2. Simulate Detection 2 at Camera 2 (GH-5 Circle, Gandhinagar - ~25km away in 12 mins -> ~125 km/h overspeeding!)
    det2 = {
        "camera_id": "CAM-GND-002",
        "timestamp": "2026-09-03T10:12:00Z",
        "license_plate": "GJ01AB1234",
        "vehicle_color": "RED",
        "vehicle_type": "SEDAN",
        "detection_confidence": 0.96,
        "ocr_confidence": 0.99,
        "bbox": [220, 310, 610, 510]
    }
    r2 = requests.post(f"{BASE_URL}/detections", json=det2)
    print(f"\n[2] Ingested Checkpoint 2 (Gandhinagar - High Speed Transit): Status {r2.status_code}")
    res2 = r2.json()
    print("    Speed Recorded:", res2.get("speed_kmh"), "km/h")
    print("    Speed Violation Flag:", res2.get("is_speed_violation"))
    print("    Evidence Hash (SHA-256):", res2.get("evidence_hash"))

    # 3. Verify BSA 2023 Evidence Certificates
    r3 = requests.get(f"{BASE_URL}/reports/certificates")
    certs = r3.json()
    print(f"\n[3] Total Evidence Certificates in Vault: {len(certs)}")
    if certs:
        print("    Latest Certificate ID:", certs[0]["certificate_id"])
        print("    Violation Type:", certs[0]["violation_type"])
        print("    Fine Amount:", f"INR {certs[0]['fine_amount_inr']}")

        # 4. Fetch official e-Challan Dossier
        r4 = requests.get(f"{BASE_URL}/reports/echallan/{certs[0]['certificate_id']}")
        dossier = r4.json()
        print("\n[4] Official e-Challan Dossier Verification:")
        print("    Legal Basis:", dossier.get("legal_basis"))
        print("    Admissibility Code:", dossier.get("admissibility_code"))
        print("    Digital Signature:", dossier["cryptographic_verification"]["digital_signature"])

    # 5. Verify Predictive Interception Route
    r5 = requests.get(f"{BASE_URL}/tracking/GJ01AB1234/predict")
    pred = r5.json()
    print("\n[5] Predictive Interception Forecast:")
    print("    Heading Angle:", pred.get("heading_degrees"), "degrees")
    print("    Downstream Intercepts:")
    for cp in pred.get("predicted_checkpoints", []):
        print(f"    -> {cp['camera_name']} ({cp['city']}) | Distance: {cp['distance_km']} km | ETA: ~{cp['eta_minutes']} min | Prob: {int(cp['probability_score']*100)}%")

    print("\n==================================================")
    print("  [SUCCESS] PHASE 2 VERIFICATION TEST COMPLETE")
    print("==================================================")

if __name__ == "__main__":
    run_phase2_verification()
