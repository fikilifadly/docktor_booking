# Backend Testing Strategy

## Overview

This document describes the testing approach for the FastAPI + GraphQL appointment booking system. **unit tests** and **integration tests** was set up to ensure code quality and system reliability.

## Test Types

### Unit Tests
**Purpose**: Test individual functions and components in isolation.

**What I Test**:
- JWT token generation and validation
- Business logic functions (conflict detection, data validation)
- Individual GraphQL resolvers
- Utility functions and helpers

**Strategy**: 
- Mock external dependencies (database, external APIs)
- Fast execution (no database required)
- High coverage of business logic

### Integration Tests
**Purpose**: Test API endpoints with real database interactions.

**What We Test**:
- Complete HTTP request/response cycles
- Database operations and persistence
- GraphQL query/mutation execution
- Authentication and authorization flows

**Strategy**:
- Real PostgreSQL database (not mocked)
- Transaction rollback for test isolation
- End-to-end workflow validation

## Test Categories

### 1. Authentication Tests (`test_auth_login.py`)
**Type**: Integration Tests

**Tests**:
- `test_login_success`: Valid credentials return JWT token
- `test_login_invalid_credentials`: Invalid credentials return 401
- `test_login_rate_limit`: Rate limiting prevents brute force

### 2. GraphQL Appointment Tests (`test_graphql_appointments.py`)
**Type**: Integration Tests

**Tests**:
- `test_list_empty_then_create_and_list`: **Appointment Retrieval Test**
  - Creates appointments → queries them → verifies data
- `test_double_book_rejected`: Prevents double booking conflicts
- `test_cancel_flow`: Tests appointment cancellation

### 3. Integration Tests (`test_integration_appointments.py`)
**Type**: Integration Tests

**Tests**:
- `test_book_appointment_integration`: **Appointment Booking Test**
  - Sends booking mutation → verifies creation → validates response

## Test Architecture

### Database Strategy
- **Production**: `postgresql://postgres:postgres@postgres:5432/appointment_db`
- **Tests**: `postgresql://postgres:postgres@postgres-test:5432/appointment_test_db`
- **Isolation**: Transaction rollback for each test (no data persistence)

### Test Isolation
```python
@pytest.fixture(scope="function")
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()  # ← Complete isolation!
    connection.close()
```

### GraphQL Context Injection
```python
# Router injects database session into GraphQL context
@router.post("")
async def graphql_post(request: Request, db_session = Depends(get_db_session)):
    context_value = {"db_session": db_session}
    result = schema.execute(query, context_value=context_value)
```

## Running Tests

```bash
# Run all tests (backend + frontend)
make test

# Run backend tests only
make test-backend

# Run frontend tests only
make test-frontend

# Start all services
make start

# Stop all services
make stop

# Clean up everything
make clean
```

## Test Data

- **Users**: `patient_1`, `patient_2` (credentials: `alice@example.com` / `password123`)
- **Doctors**: `dr_house`, `dr_strange`, `dr_mcoy`, `dr_grey`
- **Time Slots**: Future timestamps (1-3 hours ahead)
- **Conflict Detection**: Same doctor + time slot = rejection

## Key Benefits

**Idempotent Tests**: Run multiple times without side effects  
**Fast Execution**: Transaction rollback (no database cleanup)  
**Real Database**: Authentic integration testing  
**Component Isolation**: Each test gets clean state  
**Easy Maintenance**: Clear test structure and naming
