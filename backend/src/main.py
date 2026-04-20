from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.core.db import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from src.auth.router import router as auth_router
from src.graphql.router import router as graphql_router

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Place startup logic here (e.g., warm caches, health checks)
    # We avoid creating tables here; use Alembic migrations instead.
    yield
    # Place shutdown logic here if needed


app = FastAPI(
    title="Appointment Booking API",
    version="1.0.0",
    description=(
        "REST + GraphQL backend for appointment booking.\n\n"
        "**Auth**: POST `/auth/login` → receive a Bearer JWT → pass it as "
        "`Authorization: Bearer <token>` on all `/graphql` requests.\n\n"
        "**GraphQL**: all queries and mutations are served at `POST /graphql`. "
        "See the API contract at `backend/docs/API_CONTRACT.md` for the full "
        "GraphQL schema (types, queries, mutations)."
    ),
    lifespan=lifespan,
)

# CORS: allow frontend dev origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(graphql_router)

@app.get("/", summary="Health check", tags=["meta"])
async def root():
    """Returns a simple liveness message confirming the API is running."""
    return {"message": "Appointment Booking API"}
