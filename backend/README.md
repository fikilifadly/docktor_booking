# HealthPlus Backend - FastAPI + GraphQL + PostgreSQL

A modern appointment booking API built with FastAPI, GraphQL, and PostgreSQL, featuring comprehensive testing infrastructure and clean architecture patterns.

## 🛠️ Technical Stack

- **FastAPI** - Modern Python web framework with automatic API documentation
- **GraphQL** - Efficient data fetching with typed queries and mutations
- **PostgreSQL** - Robust relational database with timezone support
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Alembic** - Database migration management
- **JWT** - Secure token-based authentication
- **Pytest** - Testing framework with comprehensive test coverage
- **Docker** - Containerized development and deployment

## 🏗️ Architecture Decisions

### Clean Architecture Principles
- **Dependency Injection**: GraphQL resolvers use context-based database sessions
- **Separation of Concerns**: Authentication, GraphQL, and database layers are isolated
- **Test-Driven Design**: Comprehensive test suite with transaction rollback isolation
- **Database Abstraction**: SQLAlchemy ORM with proper session management

### GraphQL-First Design
- **Type Safety**: Strongly typed schema with proper validation
- **Efficient Queries**: Single endpoint for all data operations
- **Real-time Updates**: Optimistic updates with proper error handling
- **Context Injection**: Database sessions injected via GraphQL context

## 📁 Project Structure

```
backend/
├── src/                    # Source code
│   ├── auth/              # Authentication module
│   │   ├── jwt_utils.py   # JWT token generation and validation
│   │   ├── users_hardcoded.py # User management
│   │   └── router.py      # Auth endpoints
│   ├── core/              # Core functionality
│   │   └── db.py         # Database configuration and session management
│   ├── graphql/           # GraphQL implementation
│   │   ├── appointments/  # Appointment queries and mutations
│   │   │   ├── query.py   # Appointment queries (list, by doctor)
│   │   │   └── mutation.py # Appointment mutations (create, cancel)
│   │   ├── doctors/       # Doctor data and queries
│   │   │   ├── data.py    # Doctor data and specialties
│   │   │   └── query.py   # Doctor queries
│   │   ├── router.py      # GraphQL endpoint with context injection
│   │   ├── schema.py      # GraphQL schema definition
│   │   └── types.py       # GraphQL type definitions
│   ├── models/            # Database models
│   │   └── appointment.py # Appointment model with SQLAlchemy
│   ├── tests/             # Test suite
│   │   ├── conftest.py   # Test fixtures and database setup
│   │   ├── test_auth_login.py # Authentication tests
│   │   ├── test_graphql_appointments.py # GraphQL tests
│   │   └── test_integration_appointments.py # Integration tests
│   └── main.py           # FastAPI application entry point
├── alembic/               # Database migrations
│   ├── versions/         # Migration files
│   └── env.py           # Alembic environment configuration
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
└── README.md            # This file
```

## 🔄 Application Flow

### Authentication Flow
```
Login Request → JWT Validation → Rate Limiting → Token Generation → Response
```

### GraphQL Flow
```
GraphQL Request → Authentication → Context Injection → Resolver → Database → Response
```

### Database Flow
```
GraphQL Resolver → Context Session → SQLAlchemy ORM → PostgreSQL → Transaction Rollback (Tests)
```

## 🔐 Authentication & Security

### JWT Implementation
- **HS256 Signing**: Secure token generation and validation
- **Rate Limiting**: 10 login attempts per minute per IP
- **Token Scoping**: Patient ID embedded in JWT for request authorization
- **Automatic Validation**: Middleware validates tokens on protected routes

### Security Features
- **Input Validation**: Pydantic models for request validation
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Error Handling**: Secure error responses without sensitive data exposure

## 🗄️ Database Design

### PostgreSQL Configuration
- **Timezone**: Asia/Jakarta (GMT+7) for proper time handling
- **Connection Pooling**: Efficient database connection management
- **Migrations**: Alembic for schema version control
- **Test Isolation**: Separate test database with transaction rollback

### Data Models
- **Appointments**: Core appointment entity with status tracking
- **Conflict Prevention**: Application-level conflict checking
- **Soft Deletes**: Cancelled appointments free up time slots
- **Audit Trail**: Created/updated timestamps for all records

## 🧪 Testing Strategy

### Test Architecture
- **Integration Tests**: Real PostgreSQL database (not mocked)
- **Transaction Rollback**: Each test runs in isolated transaction
- **Context Injection**: Database sessions injected via GraphQL context
- **Idempotent Tests**: Tests can run multiple times without side effects

### Test Categories
- **Authentication Tests**: Login, validation, rate limiting
- **GraphQL Tests**: Query and mutation testing
- **Integration Tests**: End-to-end workflow validation

## 🚀 Key Features

### Appointment Management
- **CRUD Operations**: Create, read, update, cancel appointments
- **Time Slot Availability**: Real-time checking with conflict prevention
- **Status Tracking**: Scheduled, cancelled, completed appointment states
- **Doctor Integration**: Doctor-specific appointment queries

### Business Logic
- **Conflict Prevention**: Prevents double-booking of same time slots
- **Timezone Handling**: Proper time conversion between frontend and backend
- **Cancellation Logic**: Cancelled appointments free up time slots
- **Validation**: Comprehensive input validation and error handling

## 🛠️ Development Commands

```bash
# Start all services
make start

# Run all tests
make test

# Run backend tests only
make test-backend

# Run frontend tests only
make test-frontend

# Stop all services
make stop

# Clean up everything
make clean
```

## 🔐 Test Data & Credentials

### Hardcoded User Credentials
For testing and demonstration purposes, the following user credentials are available:

- **Email**: `alice@example.com`
- **Password**: `password123`
- **Patient ID**: `patient_1`

### Hardcoded Doctor Data
The system includes pre-configured doctor profiles:

- **Dr. House** - Internal Medicine Specialist
- **Dr. Strange** - Neurology Specialist  
- **Dr. McCoy** - Cardiology Specialist
- **Dr. Grey** - General Practice
- **Dr. Murphy** - Orthopedics Specialist
- **Dr. Who** - Emergency Medicine

Each doctor has:
- Professional profile with specialty
- Available time slots (9 AM - 5 PM)
- Photo and detailed information
- Real-time availability checking

## 🎯 Benefits Achieved

### Developer Experience
- **Auto Documentation**: Automatic API docs with FastAPI
- **Hot Reload**: Fast development with uvicorn
- **Comprehensive Testing**: Reliable code with good test coverage

### Performance
- **Efficient Queries**: GraphQL reduces over-fetching
- **Connection Pooling**: Optimized database connections
- **Transaction Management**: Proper database transaction handling
- **Caching Ready**: Architecture supports easy caching implementation

### Maintainability
- **Clean Architecture**: Clear separation of concerns
- **Test Isolation**: Reliable test suite with proper isolation
- **Modular Design**: Easy to extend and modify
- **Documentation**: Comprehensive API and code documentation

This architecture provides a solid foundation for building scalable, maintainable backend APIs while ensuring data integrity and security.