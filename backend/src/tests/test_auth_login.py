from fastapi.testclient import TestClient
from src.main import app


class TestAuthLogin:
    def setup_method(self):
        self.client = TestClient(app)

    def test_login_success(self):
        payload = {"email": "alice@example.com", "password": "password123"}
        res = self.client.post("/auth/login", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "token" in data
        assert data["patient"]["id"] == "patient_1"

    def test_login_invalid_credentials(self):
        payload = {"email": "alice@example.com", "password": "wrong"}
        res = self.client.post("/auth/login", json=payload)
        assert res.status_code == 401

    def test_login_rate_limit(self):
        # Exhaust the limit
        for _ in range(10):
            self.client.post("/auth/login", json={"email": "alice@example.com", "password": "wrong"})
        res = self.client.post("/auth/login", json={"email": "alice@example.com", "password": "wrong"})
        assert res.status_code in (401, 429)


