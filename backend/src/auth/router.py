from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
import time

from src.auth.users_hardcoded import validate_credentials
from src.auth.jwt_utils import issue_token


router = APIRouter(prefix="/auth", tags=["auth"])


class PatientOut(BaseModel):
    id: str
    email: str


class LoginResponse(BaseModel):
    token: str
    patient: PatientOut


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


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Authenticate and obtain a JWT",
    responses={
        200: {"description": "Successful login — returns a Bearer JWT and patient info"},
        401: {"description": "Invalid credentials"},
        422: {"description": "Validation error (e.g. malformed email)"},
        429: {"description": "Rate limit exceeded — 10 requests/min/IP"},
    },
)
def login(payload: LoginInput, request: Request):
    """
    Exchange email + password for a signed JWT (HS256, expires in 60 minutes).

    Pass the returned `token` as `Authorization: Bearer <token>` on all
    subsequent GraphQL requests.

    **Dev credentials:**
    - `alice@example.com` / `password123`
    - `bob@example.com` / `password456`
    """
    check_rate_limit(request)
    user = validate_credentials(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = issue_token(patient_id=user["id"], email=user["email"])
    return {"token": token, "patient": user}


