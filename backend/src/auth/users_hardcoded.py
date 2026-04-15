from typing import Dict


# email -> user record
USERS: Dict[str, Dict[str, str]] = {
    "alice@example.com": {"id": "patient_1", "email": "alice@example.com", "password": "password123"},
    "bob@example.com": {"id": "patient_2", "email": "bob@example.com", "password": "password456"},
}


def validate_credentials(email: str, password: str):
    user = USERS.get(email)
    if not user:
        return None
    if user["password"] != password:
        return None
    return {"id": user["id"], "email": user["email"]}


