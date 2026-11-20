import pytest
from fastapi.testclient import TestClient
import os
import sys

# Ensure server module can be loaded
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from server import app
from jose import jwt

SECRET_KEY = "CHANGE_ME_SUPER_SECRET_256_BITS_MINIMUM_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
ALGORITHM = "HS256"

client = TestClient(app)

def get_auth_header(email="test.patient@example.com", role="ROLE_PATIENT"):
    token = jwt.encode({"sub": email, "role": role}, SECRET_KEY, algorithm=ALGORITHM)
    return {"Authorization": f"Bearer {token}"}

def test_health_endpoint():
    res = client.get("/api/symptoms/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "UP"
    assert "service" in data

def test_symptom_check_requires_auth():
    res = client.post("/api/symptoms/check", json={"symptoms": "Fever and sore throat"})
    assert res.status_code == 401

def test_symptom_check_with_auth_heuristic():
    headers = get_auth_header()
    res = client.post(
        "/api/symptoms/check",
        json={"symptoms": "Red itchy rash with raised bumps on skin for 2 days"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    assert data["recommended_specialty"] == "Dermatology"
    assert len(data["conditions"]) > 0
    assert data["is_emergency"] is False

def test_emergency_symptom_triage():
    headers = get_auth_header()
    res = client.post(
        "/api/symptoms/check",
        json={"symptoms": "Severe acute crushing chest pain radiating to left arm and cannot breathe"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_emergency"] is True
    assert data["recommended_specialty"] == "Cardiology"

def test_profile_update_and_get():
    headers = get_auth_header("profile.user@example.com")
    # Update profile
    put_res = client.post(
        "/api/user/profile",
        json={"age": 42, "gender": "Male", "pre_existing_conditions": "Asthma"},
        headers=headers
    )
    assert put_res.status_code == 200

    # Get profile
    get_res = client.get("/api/user/profile", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["age"] == 42
    assert data["gender"] == "Male"
    assert data["pre_existing_conditions"] == "Asthma"

def test_history_workflow():
    headers = get_auth_header("history.user@example.com")
    # 1. Create a check
    check_res = client.post(
        "/api/symptoms/check",
        json={"symptoms": "Severe throbbing unilateral headache with light sensitivity"},
        headers=headers
    )
    assert check_res.status_code == 200
    check_id = check_res.json()["id"]

    # 2. Get history
    hist_res = client.get("/api/history", headers=headers)
    assert hist_res.status_code == 200
    items = hist_res.json()
    assert any(item["id"] == check_id for item in items)

    # 3. Doctor/Patient appointment context lookup
    ctx_res = client.get(f"/api/symptoms/appointment-context/{check_id}", headers=headers)
    assert ctx_res.status_code == 200
    assert ctx_res.json()["id"] == check_id
    assert ctx_res.json()["recommended_specialty"] == "Neurology"

    # 4. Delete item
    del_res = client.delete(f"/api/history/{check_id}", headers=headers)
    assert del_res.status_code == 200
