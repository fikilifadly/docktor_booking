"""
Simple backend integration test for appointment booking.
"""

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from src.auth.jwt_utils import issue_token

@pytest.mark.integration
class TestAppointmentBooking:
    def auth_headers(self, patient_id: str):
        token = issue_token(patient_id=patient_id, email="test@example.com")
        return {"Authorization": f"Bearer {token}"}

    def test_book_appointment_integration(self, client):
        """Test the book appointment GraphQL mutation."""
        # Create appointment time (1 hour from now - clean DB so no conflicts)
        appointment_time = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=1)
        
        # Send the book appointment GraphQL mutation
        mutation = f"""
        mutation {{
          createAppointment(doctorId: "dr_house", startTime: "{appointment_time.isoformat()}") {{
            ok
            error
            appointment {{
              id
              doctorId
              startTime
              durationMinutes
              status
            }}
          }}
        }}
        """
        
        res = client.post(
            "/graphql", 
            json={"query": mutation}, 
            headers=self.auth_headers("patient_1")
        )
        
        # Verify response
        assert res.status_code == 200
        data = res.json()["data"]["createAppointment"]
        assert data["ok"] is True
        assert data["error"] is None
        
        # Verify correct appointment was created
        appointment = data["appointment"]
        assert appointment["id"] is not None
        assert appointment["doctorId"] == "dr_house"
        assert appointment["startTime"] == appointment_time.isoformat()
        assert appointment["durationMinutes"] == 60
        assert appointment["status"] == "scheduled"