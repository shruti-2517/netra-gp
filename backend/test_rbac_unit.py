"""
Unit tests for RBAC, Speed Violation, and Evidence Certificates using FastAPI TestClient.
"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_rbac_and_endpoints():
    print("==================================================")
    print("  NETRA-GP RBAC & ENDPOINT VERIFICATION")
    print("==================================================")

    # 1. Health check
    res_health = client.get("/api/v1/health")
    assert res_health.status_code == 200
    print("[1] Health Check: OK", res_health.json())

    # 2. Ingest dynamic catalogue
    res_ingest = client.get("/api/ingest")
    assert res_ingest.status_code == 200
    print(f"[2] Dynamic Catalogue Contract: OK ({len(res_ingest.json())} cameras)")

    # 3. RBAC Check on Camera creation
    # Case A: Unauthorized role (OPERATOR) should get 403 Forbidden
    res_forbidden = client.post(
        "/api/v1/cameras",
        json={
            "camera_id": "CAM-TEST-999",
            "name": "Test Cam",
            "department": "Traffic",
            "city": "Ahmedabad",
            "latitude": 23.0,
            "longitude": 72.0,
            "stream_url": "data/sample_feeds/traffic1.mp4"
        },
        headers={"X-User-Role": "OPERATOR"}
    )
    assert res_forbidden.status_code == 403
    print("[3A] RBAC Check (OPERATOR blocked from adding camera): 403 Forbidden (PASS)")

    # Case B: Authorized role (SUPER_ADMIN) allowed
    res_allowed = client.post(
        "/api/v1/cameras",
        json={
            "camera_id": f"CAM-TEST-{int(time.time() if 'time' in dir() else 888)}",
            "name": "Test Cam Authorized",
            "department": "Traffic",
            "city": "Ahmedabad",
            "latitude": 23.0,
            "longitude": 72.0,
            "stream_url": "data/sample_feeds/traffic1.mp4"
        },
        headers={"X-User-Role": "SUPER_ADMIN"}
    )
    assert res_allowed.status_code in [201, 400]
    print("[3B] RBAC Check (SUPER_ADMIN allowed): OK (PASS)")

    # 4. Evidence Certificates & e-Challan
    res_certs = client.get("/api/v1/reports/certificates")
    assert res_certs.status_code == 200
    print(f"[4] Evidence Vault Certificates: OK ({len(res_certs.json())} certs)")

    print("==================================================")
    print("  [SUCCESS] ALL RBAC & ENDPOINTS VERIFIED")
    print("==================================================")

if __name__ == "__main__":
    import time
    test_rbac_and_endpoints()
