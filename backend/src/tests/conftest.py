import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.db import get_db_session, Base

# Test DB URL (dockerized Postgres)
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@postgres-test:5432/appointment_test_db"
)

# Create engine & sessionmaker at module level
test_engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def prepare_database():
    """Create and drop schema once per test session."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    """Function-scoped SQLAlchemy session with transaction rollback for test isolation."""
    connection = test_engine.connect()
    transaction = connection.begin()
    
    # Create session bound to the connection
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    # Cleanup: rollback transaction and close connection
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with test database session override."""
    from src.main import app
    
    def override_get_db():
        """Override get_db_session to return our test session."""
        yield db_session
    
    # Override the dependency injection
    app.dependency_overrides[get_db_session] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up overrides
    app.dependency_overrides.clear()