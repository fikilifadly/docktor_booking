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
- **Expiry**: 60 minutes (configurable via `JWT_EXPIRES_MIN` env var)

---

## REST Endpoints

### GET `/`
- No auth required
- Success 200:
```json
{ "message": "Appointment Booking API" }
```

### POST `/auth/login`
- No auth required
- Request body:
```json
{ "email": "string", "password": "string" }
```
- Success 200:
```json
{ "token": "<JWT>", "patient": { "id": "string", "email": "string" } }
```
- Errors:
  - 422 Validation error → Pydantic validation failure (e.g., invalid email format)
  - 401 Invalid credentials → `{ "detail": "Invalid credentials" }`
  - 429 Too many attempts → `{ "detail": "Too many login attempts, please try again later." }`

Note: in-memory rate limit 10 requests/min/IP.

**Test credentials (dev only):**
| Email | Password | patient_id |
|---|---|---|
| alice@example.com | password123 | patient_1 |
| bob@example.com | password456 | patient_2 |

---

## GraphQL

### POST `/graphql`
- **Auth required** (all operations)
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{ "query": "<GraphQL query/mutation>", "variables": { /* optional */ } }
```
- Response body:
```json
{ "data": { /* nullable */ }, "errors": ["optional strings"] }
```
- HTTP errors (before GraphQL execution):
  - 400: Missing `query` field → `{ "detail": "Missing GraphQL query" }`
  - 401: Missing token → `{ "detail": "Missing bearer token" }`
  - 401: Invalid/expired token → `{ "detail": "Invalid token" }`

### GET `/graphql`
- Returns plain text: `"Send POST requests with GraphQL query to this endpoint."`

---

## GraphQL Types

### `Appointment`
| Field | Type | Nullable |
|---|---|---|
| id | String | No |
| patientId | String | No |
| doctorId | String | No |
| startTime | DateTime | No |
| durationMinutes | Int | No |
| status | String | No (`"active"` \| `"cancelled"`) |
| notes | String | Yes |
| createdAt | DateTime | No |
| updatedAt | DateTime | No |

### `Doctor`
| Field | Type | Nullable |
|---|---|---|
| id | String | No |
| name | String | No |
| specialty | String | No |
| avatarUrl | String | Yes |

**Available doctors:**
| id | name | specialty |
|---|---|---|
| dr_strange | Dr. Stephen Strange | Neurology |
| dr_house | Dr. Gregory House | Diagnostics |
| dr_who | Dr. Who | Pediatrician |
| dr_meredith | Dr. Meredith Grey | Dermatology |
| dr_mcCoy | Dr. Leonard McCoy | Neurology |
| dr_murphy | Dr. Shaun Murphy | Family Medicine |

### `AvailabilitySlot`
| Field | Type | Nullable |
|---|---|---|
| startTime | DateTime | No |

---

## GraphQL Queries

### `appointmentsByPatient: [Appointment]`
- Returns all appointments (any status) scoped to the JWT `sub` (patient_id), ordered by `startTime`.

Example:
```graphql
query {
  appointmentsByPatient {
    id doctorId startTime durationMinutes status notes
  }
}
```

### `appointmentsByDoctor(doctorId: String!, date: DateTime!): [Appointment]`
- Returns non-cancelled appointments for a specific doctor on a specific date.
- Auth required.
- Used for time slot availability checking; cancelled appointments are excluded (freeing up their slots for rebooking).
- `date` can be any DateTime — only the date portion (year/month/day) is used.

Example:
```graphql
query AppointmentsByDoctor($doctorId: String!, $date: DateTime!) {
  appointmentsByDoctor(doctorId: $doctorId, date: $date) {
    id startTime durationMinutes status
  }
}
```

### `doctors(q: String, specialty: String): [Doctor]`
- Returns the list of available doctors, optionally filtered.
- `q`: case-insensitive substring match on doctor name.
- `specialty`: case-insensitive exact match on specialty.
- Both filters are optional; omitting both returns all doctors.

Example:
```graphql
query {
  doctors(specialty: "Neurology") {
    id name specialty avatarUrl
  }
}
```

### `doctorAvailability(doctorId: String!, date: Date!): [AvailabilitySlot]`
- Returns available time slots for a specific doctor on a given date.
- Slots are generated at fixed hours: 11:00, 12:00, 13:00, 14:00, 15:00 UTC.
- Raises `"Doctor not found"` if `doctorId` does not exist.
- Note: `date` is a `Date` scalar (not `DateTime`), format: `YYYY-MM-DD`.

Example:
```graphql
query {
  doctorAvailability(doctorId: "dr_strange", date: "2025-10-01") {
    startTime
  }
}
```

---

## GraphQL Mutations

### `createAppointment(doctorId: String!, startTime: DateTime!, durationMinutes: Int = 60, notes: String): { ok: Boolean!, error: String, appointment: Appointment }`
- Creates a new appointment for the authenticated patient.
- **Validation rules:**
  - `startTime` must be in the future; past times return `error: "Appointment must be in the future"`
  - `durationMinutes` must be between 1 and 480 (inclusive); defaults to 60
  - `doctorId` must be a valid doctor id
  - Slot conflict check: if the time overlaps an existing non-cancelled appointment for that doctor, returns `error: "Slot already booked for this doctor"`
- Cancelled appointments free up their time slots — previously cancelled slots can be rebooked.

Example:
```graphql
mutation($doc: String!, $start: DateTime!, $dur: Int) {
  createAppointment(doctorId: $doc, startTime: $start, durationMinutes: $dur) {
    ok error appointment { id }
  }
}
```

### `cancelAppointment(id: String!): { ok: Boolean!, error: String }`
- Marks the appointment as `"cancelled"`.
- Returns `error: "Not found"` if the appointment does not exist or is not owned by the authenticated patient.

Example:
```graphql
mutation($id: String!) {
  cancelAppointment(id: $id) { ok error }
}
```

### `rescheduleAppointment(id: String!, newStartTime: DateTime!, newDurationMinutes: Int): { ok: Boolean!, error: String, appointment: Appointment }`
- Moves an existing appointment to a new time (and optionally changes duration).
- **Validation rules:**
  - Appointment must be owned by the authenticated patient; otherwise `error: "Not found"`
  - Appointment must not be cancelled; otherwise `error: "Cannot reschedule a cancelled appointment"`
  - `newStartTime` must be in the future; otherwise `error: "New time must be in the future"`
  - `newDurationMinutes` (optional) must be between 1 and 480; defaults to the existing duration
  - Slot conflict check (excluding the appointment itself): `error: "Slot already booked for this doctor"`

Example:
```graphql
mutation($id: String!, $newStart: DateTime!, $newDur: Int) {
  rescheduleAppointment(id: $id, newStartTime: $newStart, newDurationMinutes: $newDur) {
    ok error appointment { id startTime durationMinutes }
  }
}
```

### `changeDoctor(id: String!, newDoctorId: String!): { ok: Boolean!, error: String, appointment: Appointment }`
- Reassigns an existing appointment to a different doctor at the same time slot.
- **Validation rules:**
  - Appointment must be owned by the authenticated patient; otherwise `error: "Not found"`
  - Appointment must not be cancelled; otherwise `error: "Cannot change doctor for a cancelled appointment"`
  - `newDoctorId` must be a valid doctor id; otherwise `error: "Doctor not found"`
  - Slot conflict check against the new doctor's schedule (excluding the appointment itself): `error: "New doctor is not available at this time"`

Example:
```graphql
mutation($id: String!, $newDoc: String!) {
  changeDoctor(id: $id, newDoctorId: $newDoc) {
    ok error appointment { id doctorId }
  }
}
```

---

## Validation & Formats
- DateTime: ISO 8601 with timezone (e.g., `2025-10-01T09:00:00Z`)
- Date: `YYYY-MM-DD` (used by `doctorAvailability`)
- Default appointment duration: 60 minutes; range: 1–480 minutes
- All GraphQL operations scoped by JWT; backend reads `patient_id` from token
- Timezone: Backend runs in Asia/Jakarta (GMT+7) timezone
- Date handling: Frontend sends UTC datetimes; backend processes in local timezone

## Status Codes Summary
| Code | Meaning |
|---|---|
| 200 | Success (REST/GraphQL endpoint returns JSON) |
| 400 | Bad request (missing GraphQL query body) |
| 401 | Unauthorized (missing/invalid token or invalid credentials) |
| 422 | Unprocessable entity (Pydantic validation error on REST input) |
| 429 | Rate limited (login only) |

## Operational Notes
- Migrations run automatically on backend container start: `alembic upgrade head`
- Postgres service name: `postgres`; DB: `appointment_db`
- JWT secret configurable via `JWT_SECRET` env var (default: `dev-insecure-secret`)

## Change Log
- v1: Initial contract for auth + appointments (list/create/cancel)
- v2: Added time slot availability checking with `appointmentsByDoctor` query
- v2: Added timezone support (Asia/Jakarta GMT+7)
- v2: Enhanced conflict prevention — cancelled appointments free up time slots
- v3: Added missing types: `Doctor`, `AvailabilitySlot`
- v3: Added missing queries: `doctors` (with `q`/`specialty` filters), `doctorAvailability`
- v3: Added missing mutations: `rescheduleAppointment`, `changeDoctor`
- v3: Documented GET `/`, GET `/graphql`, 422 status code, JWT expiry, duration range, test credentials
