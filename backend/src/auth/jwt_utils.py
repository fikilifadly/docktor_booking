import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

import jwt


def get_jwt_secret() -> str:
    return os.getenv("JWT_SECRET", "dev-insecure-secret")


def get_jwt_exp_minutes() -> int:
    try:
        return int(os.getenv("JWT_EXPIRES_MIN", "60"))
    except ValueError:
        return 60


def issue_token(*, patient_id: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        "sub": patient_id,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=get_jwt_exp_minutes())).timestamp()),
    }
    token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        data = jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])
        return data
    except jwt.PyJWTError:
        return None


