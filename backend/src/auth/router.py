from typing import Dict
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
import time

from src.auth.users_hardcoded import validate_credentials
from src.auth.jwt_utils import issue_token


router = APIRouter(prefix="/auth", tags=["auth"])


class LoginInput(BaseModel):
    email: EmailStr
    password: str


# Simple in-memory rate limiter (per-IP): X requests per window
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 10
_requests: Dict[str, list] = {}


def rate_limit_key(req: Request) -> str:
    client_ip = req.client.host if req.client else "unknown"
    return f"login:{client_ip}"


def check_rate_limit(req: Request) -> None:
    now = time.time()
    key = rate_limit_key(req)
    bucket = _requests.setdefault(key, [])
    # drop old entries
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    while bucket and bucket[0] < cutoff:
        bucket.pop(0)
    if len(bucket) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Too many login attempts, please try again later.")
    bucket.append(now)


@router.post("/login")
def login(payload: LoginInput, request: Request):
    check_rate_limit(request)
    user = validate_credentials(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = issue_token(patient_id=user["id"], email=user["email"])
    return {"token": token, "patient": user}


