# Backend API Contract

This document specifies the external contracts for the backend: endpoints, payloads, auth, GraphQL schema, and error handling. Use this as the single source of truth for the frontend.

## Base URLs (dev)
- Backend: `http://localhost:8000`
- REST Auth: `http://localhost:8000/auth`
- GraphQL: `http://localhost:8000/graphql`
- API Docs: `http://localhost:8000/docs`

## Auth
- **Scheme**: Bearer JWT (HS256)
- **Header**: `Authorization: Bearer <token>`
- **Claims**: `{ sub: <patient_id>, email: <email>, iat, exp }`

### Login (REST)
- POST `/auth/login`
- Request body:
```json
{ "email": "string", "password": "string" }
```
- Success 200:
```json
{ "token": "<JWT>", "patient": { "id": "string", "email": "string" } }
```
- Errors:
  - 401 Invalid credentials → `{ "detail": "Invalid credentials" }`
  - 429 Too many attempts → `{ "detail": "Too many login attempts, please try again later." }`

Note: in-memory rate limit 10/min/IP.

## GraphQL
- POST `/graphql`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{ "query": "<GraphQL query/mutation>", "variables": { /* optional */ } }
```
- Response body:
```json
{ "data": { /* nullable */ }, "errors": ["optional strings"] }
```
- Unauthorized (missing/invalid token): HTTP 401 `{ "detail": "Missing bearer token" | "Invalid token" }`

### Types
- `Appointment`:
  - id: String!
  - patientId: String!
  - doctorId: String!
  - startTime: DateTime!
  - durationMinutes: Int!
  - status: String!
  - notes: String
  - createdAt: DateTime!
  - updatedAt: DateTime!

### Queries
- `appointmentsByPatient: [Appointment]`
  - Returns appointments scoped to the JWT `sub` (patient_id)

- `appointmentsByDoctor(doctorId: String!, date: DateTime!): [Appointment]`
  - Returns appointments for a specific doctor on a specific date
  - Excludes cancelled appointments (allows rebooking of cancelled time slots)
  - Still requires authentication (JWT token)
  - Used for time slot availability checking

Examples:
```graphql
query { appointmentsByPatient { id doctorId startTime durationMinutes status notes } }
```
```graphql
query AppointmentsByDoctor($doctorId: String!, $date: DateTime!) {
  appointmentsByDoctor(doctorId: $doctorId, date: $date) {
    id
    startTime
    durationMinutes
    status
  }
}
```

### Mutations
- `createAppointment(doctorId: String!, startTime: DateTime!, durationMinutes: Int = 60, notes: String): { ok: Boolean!, error: String, appointment: Appointment }`
  - Errors: `error` contains human message (e.g., "Slot already booked for this doctor")
  - Double-booking prevented by application-level conflict checking
  - **Cancelled appointments free up their time slots** - you can book a time slot that was previously cancelled

- `cancelAppointment(id: String!): { ok: Boolean!, error: String }`
  - Error if not owned by patient or not found: `error = "Not found"`

Examples:
```graphql
mutation($doc: String!, $start: DateTime!, $dur: Int){
  createAppointment(doctorId: $doc, startTime: $start, durationMinutes: $dur){ ok error appointment { id }}
}
```
```graphql
mutation($id: String!){ cancelAppointment(id: $id){ ok error } }
```

## Validation & Formats
- DateTime: ISO 8601 with timezone (e.g., `2025-10-01T09:00:00Z`)
- Default appointment duration: 60 minutes
- All GraphQL operations scoped by JWT; backend reads `patient_id` from token
- Timezone: Backend runs in Asia/Jakarta (GMT+7) timezone
- Date handling: Frontend sends UTC dates, backend processes in local timezone

## Status Codes Summary
- 200: Success (REST/GraphQL endpoint returns JSON)
- 400: Bad request (missing GraphQL query body)
- 401: Unauthorized (missing/invalid token)
- 429: Rate limited (login only)

## Operational Notes
- Migrations run automatically on backend container start: `alembic upgrade head`
- Postgres service name: `postgres`; DB: `appointment_db`

## Change Log
- v1: Initial contract for auth + appointments (list/create/cancel)
- v2: Added time slot availability checking with `appointmentsByDoctor` query
- v2: Added timezone support (Asia/Jakarta GMT+7)
- v2: Enhanced conflict prevention - cancelled appointments free up time slots
