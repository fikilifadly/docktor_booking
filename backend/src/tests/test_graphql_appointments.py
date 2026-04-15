from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from src.auth.jwt_utils import issue_token


class TestGraphQLAppointments:
    def auth_headers(self, patient_id: str, email: str = "alice@example.com"):
        token = issue_token(patient_id=patient_id, email=email)
        return {"Authorization": f"Bearer {token}"}

    def test_list_empty_then_create_and_list(self, client):
        # Fresh DB - list should be empty first
        query = """
        query { appointmentsByPatient { id } }
        """
        res = client.post("/graphql", json={"query": query}, headers=self.auth_headers("patient_1"))
        assert res.status_code == 200
        assert res.json().get("data", {}).get("appointmentsByPatient") == []

        # create appointment
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=1)
        mutation = f"""
        mutation {{
          createAppointment(doctorId: "dr_house", startTime: "{start.isoformat()}") {{
            ok
            error
            appointment {{ id doctorId durationMinutes }}
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mutation}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["createAppointment"]
        assert data["ok"] is True
        appt_id = data["appointment"]["id"]
        assert data["appointment"]["durationMinutes"] == 60

        # list appointments to verify it was created
        res = client.post("/graphql", json={"query": query}, headers=self.auth_headers("patient_1"))
        items = res.json()["data"]["appointmentsByPatient"]
        assert len(items) == 1
        assert items[0]["id"] == appt_id

    def test_double_book_rejected(self, client):
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=2)
        mutation = f"""
        mutation {{
          createAppointment(doctorId: "dr_strange", startTime: "{start.isoformat()}" ) {{ ok error }}
        }}
        """
        # first create ok
        res1 = client.post("/graphql", json={"query": mutation}, headers=self.auth_headers("patient_1"))
        assert res1.json()["data"]["createAppointment"]["ok"] is True
        # second same slot/doctor should fail
        res2 = client.post("/graphql", json={"query": mutation}, headers=self.auth_headers("patient_2"))
        payload = res2.json()["data"]["createAppointment"]
        assert payload["ok"] is False
        assert "booked" in payload["error"].lower()

    def test_cancel_flow(self, client):
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=3)
        create_mut = f"""
        mutation {{
          createAppointment(doctorId: "dr_mcoy", startTime: "{start.isoformat()}" ) {{ ok appointment {{ id }} }}
        }}
        """
        res = client.post("/graphql", json={"query": create_mut}, headers=self.auth_headers("patient_1"))
        appt_id = res.json()["data"]["createAppointment"]["appointment"]["id"]

        cancel_mut = f"""
        mutation {{ cancelAppointment(id: "{appt_id}") {{ ok error }} }}
        """
        res = client.post("/graphql", json={"query": cancel_mut}, headers=self.auth_headers("patient_1"))
        assert res.json()["data"]["cancelAppointment"]["ok"] is True

    # BE-001: duration_minutes=0 must be rejected
    def test_zero_duration_rejected(self, client):
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=1)
        mutation = f"""
        mutation {{
          createAppointment(doctorId: "dr_zero", startTime: "{start.isoformat()}", durationMinutes: 0) {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mutation}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["createAppointment"]
        assert data["ok"] is False

    # BE-002: booking a past time must be rejected
    def test_past_appointment_rejected(self, client):
        past = datetime.now(timezone.utc).replace(microsecond=0) - timedelta(hours=1)
        mutation = f"""
        mutation {{
          createAppointment(doctorId: "dr_past", startTime: "{past.isoformat()}") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mutation}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["createAppointment"]
        assert data["ok"] is False
        assert "future" in data["error"].lower()

    # BE-003: cancelled slot can be rebooked
    def test_cancelled_slot_can_be_rebooked(self, client):
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=4)
        create_mut = f"""
        mutation {{
          createAppointment(doctorId: "dr_rebooking", startTime: "{start.isoformat()}") {{
            ok appointment {{ id }}
          }}
        }}
        """
        res = client.post("/graphql", json={"query": create_mut}, headers=self.auth_headers("patient_1"))
        appt_id = res.json()["data"]["createAppointment"]["appointment"]["id"]

        # Cancel it
        cancel_mut = f"""
        mutation {{ cancelAppointment(id: "{appt_id}") {{ ok }} }}
        """
        client.post("/graphql", json={"query": cancel_mut}, headers=self.auth_headers("patient_1"))

        # Same slot should now be bookable again
        res2 = client.post("/graphql", json={"query": create_mut}, headers=self.auth_headers("patient_2"))
        assert res2.json()["data"]["createAppointment"]["ok"] is True

    # BE-004: adjacent slots must NOT conflict
    def test_adjacent_slots_allowed(self, client):
        base = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=5)
        slot1_end = base + timedelta(minutes=60)  # 05:00–06:00

        mut1 = f"""
        mutation {{
          createAppointment(doctorId: "dr_adjacent", startTime: "{base.isoformat()}", durationMinutes: 60) {{
            ok error
          }}
        }}
        """
        mut2 = f"""
        mutation {{
          createAppointment(doctorId: "dr_adjacent", startTime: "{slot1_end.isoformat()}", durationMinutes: 60) {{
            ok error
          }}
        }}
        """
        res1 = client.post("/graphql", json={"query": mut1}, headers=self.auth_headers("patient_1"))
        assert res1.json()["data"]["createAppointment"]["ok"] is True

        res2 = client.post("/graphql", json={"query": mut2}, headers=self.auth_headers("patient_2"))
        assert res2.json()["data"]["createAppointment"]["ok"] is True

    # BE-005: a different patient must not be able to cancel another's appointment
    def test_cancel_other_patient_appointment_rejected(self, client):
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=6)
        create_mut = f"""
        mutation {{
          createAppointment(doctorId: "dr_auth", startTime: "{start.isoformat()}") {{
            ok appointment {{ id }}
          }}
        }}
        """
        res = client.post("/graphql", json={"query": create_mut}, headers=self.auth_headers("patient_1"))
        appt_id = res.json()["data"]["createAppointment"]["appointment"]["id"]

        # patient_2 tries to cancel patient_1's appointment
        cancel_mut = f"""
        mutation {{ cancelAppointment(id: "{appt_id}") {{ ok error }} }}
        """
        res2 = client.post("/graphql", json={"query": cancel_mut}, headers=self.auth_headers("patient_2"))
        data = res2.json()["data"]["cancelAppointment"]
        assert data["ok"] is False

    # BE-006: invalid/tampered JWT must be rejected with 401
    def test_invalid_jwt_rejected(self, client):
        query = """
        query { appointmentsByPatient { id } }
        """
        res = client.post(
            "/graphql",
            json={"query": query},
            headers={"Authorization": "Bearer this.is.not.a.valid.token"},
        )
        # GraphQL returns 200 with an error, or the middleware returns 401
        body = res.json()
        if res.status_code == 200:
            # Must not return patient data — either errors or empty unauthorized response
            data = body.get("data", {}) or {}
            assert data.get("appointmentsByPatient") is None
        else:
            assert res.status_code == 401

    # ── rescheduleAppointment ──────────────────────────────────────────────────

    def _create_appointment(self, client, doctor_id: str, hours_from_now: int, patient: str = "patient_1") -> str:
        """Helper: create an appointment and return its id."""
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=hours_from_now)
        mut = f"""
        mutation {{
          createAppointment(doctorId: "{doctor_id}", startTime: "{start.isoformat()}") {{
            ok appointment {{ id }}
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers(patient))
        return res.json()["data"]["createAppointment"]["appointment"]["id"]

    def test_reschedule_success(self, client):
        appt_id = self._create_appointment(client, "dr_reschedule", hours_from_now=10)
        new_start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=20)
        mut = f"""
        mutation {{
          rescheduleAppointment(id: "{appt_id}", newStartTime: "{new_start.isoformat()}") {{
            ok error appointment {{ id startTime }}
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["rescheduleAppointment"]
        assert data["ok"] is True
        assert data["appointment"]["id"] == appt_id

    def test_reschedule_to_past_rejected(self, client):
        appt_id = self._create_appointment(client, "dr_reschedule_past", hours_from_now=10)
        past = datetime.now(timezone.utc).replace(microsecond=0) - timedelta(hours=1)
        mut = f"""
        mutation {{
          rescheduleAppointment(id: "{appt_id}", newStartTime: "{past.isoformat()}") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["rescheduleAppointment"]
        assert data["ok"] is False
        assert "future" in data["error"].lower()

    def test_reschedule_cancelled_appointment_rejected(self, client):
        appt_id = self._create_appointment(client, "dr_reschedule_cancel", hours_from_now=10)
        # Cancel first
        client.post("/graphql", json={"query": f'mutation {{ cancelAppointment(id: "{appt_id}") {{ ok }} }}'}, headers=self.auth_headers("patient_1"))
        new_start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=20)
        mut = f"""
        mutation {{
          rescheduleAppointment(id: "{appt_id}", newStartTime: "{new_start.isoformat()}") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["rescheduleAppointment"]
        assert data["ok"] is False
        assert "cancelled" in data["error"].lower()

    def test_reschedule_other_patient_rejected(self, client):
        appt_id = self._create_appointment(client, "dr_reschedule_auth", hours_from_now=10)
        new_start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=20)
        mut = f"""
        mutation {{
          rescheduleAppointment(id: "{appt_id}", newStartTime: "{new_start.isoformat()}") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_2"))
        data = res.json()["data"]["rescheduleAppointment"]
        assert data["ok"] is False

    def test_reschedule_conflict_rejected(self, client):
        # Two appointments for same doctor; try to move first onto second's slot
        base = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=30)
        occupied = base + timedelta(hours=2)
        appt_id = self._create_appointment(client, "dr_conflict_rs", hours_from_now=30)
        self._create_appointment(client, "dr_conflict_rs", hours_from_now=32, patient="patient_2")
        mut = f"""
        mutation {{
          rescheduleAppointment(id: "{appt_id}", newStartTime: "{occupied.isoformat()}") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["rescheduleAppointment"]
        assert data["ok"] is False
        assert "booked" in data["error"].lower()

    def test_reschedule_same_slot_allowed(self, client):
        """Rescheduling to the same slot must not conflict with itself."""
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=40)
        appt_id = self._create_appointment(client, "dr_self_rs", hours_from_now=40)
        mut = f"""
        mutation {{
          rescheduleAppointment(id: "{appt_id}", newStartTime: "{start.isoformat()}") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["rescheduleAppointment"]
        assert data["ok"] is True

    # ── changeDoctor ───────────────────────────────────────────────────────────

    def test_change_doctor_success(self, client):
        appt_id = self._create_appointment(client, "dr_house", hours_from_now=50)
        mut = f"""
        mutation {{
          changeDoctor(id: "{appt_id}", newDoctorId: "dr_who") {{
            ok error appointment {{ id doctorId }}
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["changeDoctor"]
        assert data["ok"] is True
        assert data["appointment"]["doctorId"] == "dr_who"

    def test_change_doctor_invalid_doctor_rejected(self, client):
        appt_id = self._create_appointment(client, "dr_house", hours_from_now=60)
        mut = f"""
        mutation {{
          changeDoctor(id: "{appt_id}", newDoctorId: "dr_nobody") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["changeDoctor"]
        assert data["ok"] is False
        assert "not found" in data["error"].lower()

    def test_change_doctor_cancelled_appointment_rejected(self, client):
        appt_id = self._create_appointment(client, "dr_house", hours_from_now=70)
        client.post("/graphql", json={"query": f'mutation {{ cancelAppointment(id: "{appt_id}") {{ ok }} }}'}, headers=self.auth_headers("patient_1"))
        mut = f"""
        mutation {{
          changeDoctor(id: "{appt_id}", newDoctorId: "dr_who") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["changeDoctor"]
        assert data["ok"] is False
        assert "cancelled" in data["error"].lower()

    def test_change_doctor_other_patient_rejected(self, client):
        appt_id = self._create_appointment(client, "dr_house", hours_from_now=80)
        mut = f"""
        mutation {{
          changeDoctor(id: "{appt_id}", newDoctorId: "dr_who") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_2"))
        data = res.json()["data"]["changeDoctor"]
        assert data["ok"] is False

    def test_change_doctor_conflict_rejected(self, client):
        """New doctor already has an appointment at the same time."""
        start = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(hours=90)
        # patient_1 books dr_strange
        appt_id = self._create_appointment(client, "dr_strange", hours_from_now=90)
        # patient_2 books dr_who at the same time
        self._create_appointment(client, "dr_who", hours_from_now=90, patient="patient_2")
        mut = f"""
        mutation {{
          changeDoctor(id: "{appt_id}", newDoctorId: "dr_who") {{
            ok error
          }}
        }}
        """
        res = client.post("/graphql", json={"query": mut}, headers=self.auth_headers("patient_1"))
        data = res.json()["data"]["changeDoctor"]
        assert data["ok"] is False
        assert "available" in data["error"].lower()


