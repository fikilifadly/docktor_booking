# HealthPlus — Frontend Developer Challenge

A full-stack appointment booking system where patients can schedule, manage, and cancel appointments with doctors.

---

## What You're Working With

This is **not** a build-from-scratch task. A working implementation of the full application already exists across `backend/` and `frontend/`. Your job is to:

1. **Fix existing bugs** in the frontend — see [`FRONTEND_BUGS.md`](./FRONTEND_BUGS.md)
2. **Implement new features** in the frontend — see [`FRONTEND_FEATURES.md`](./FRONTEND_FEATURES.md)
3. **Implement Playwright** as the end to end test using [Playwright](https://playwright.dev/)

For features that require backend mutations, the backend is already implemented — you only need to wire up the frontend.

---

## Repository Structure

```
.
├── backend/          # FastAPI + GraphQL Python API
├── frontend/         # React + TypeScript web app  ← your main workspace
├── design/           # Desktop UI mockups (HTML + assets)
│   └── mobile/       # Mobile UI mockups
├── FRONTEND_BUGS.md  # Bugs to fix (with descriptions)
├── FRONTEND_FEATURES.md  # Features to implement
└── Makefile          # Dev & test commands
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js ≥ 18
- npm

### Start the backend

```bash
make start
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| GraphQL endpoint | http://localhost:8000/graphql |
| API Docs (Swagger) | http://localhost:8000/docs |

### Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** by default.

### Test accounts

Use these credentials to log in (hardcoded in the backend):

| Email | Password | Patient ID |
|-------|----------|------------|
| alice@example.com | password123 | patient_1 |
| bob@example.com | password456 | patient_2 |

---

## Your Tasks

### 1. Fix Frontend Bugs — [`FRONTEND_BUGS.md`](./FRONTEND_BUGS.md)

Six bugs are intentionally present in the frontend.

The test suite will tell you when each bug is fixed: `make test-frontend`.

### 2. Implement New Frontend Features — [`FRONTEND_FEATURES.md`](./FRONTEND_FEATURES.md)

Seven features are listed (four standard + three bonus). Each entry describes:
- **Feature** — what to build
- **Impact** — why it matters

### 3. Implement Playwright End-to-End Tests

Use your best judgement and produce E2E test using [Playwright](https://playwright.dev/) that runs against the full running stack. Do not stuck with existing test script. Be mindfull

---

## Backend GraphQL API

### Authentication
```
POST /auth/login
Body: { email, password }
Returns: { token, patient: { id, email } }
```

All GraphQL requests require:
```
Authorization: Bearer <token>
```

### Queries
| Query | Arguments | Description |
|-------|-----------|-------------|
| `appointmentsByPatient` | — | Returns the logged-in patient's appointments |
| `appointmentsByDoctor` | `doctorId`, `date` | Returns a doctor's non-cancelled appointments for a given day |
| `doctors` | `q?`, `specialty?` | Lists doctors with optional name search and specialty filter |
| `doctorAvailability` | `doctorId`, `date` | Returns available time slots for a doctor on a given date |

### Mutations
| Mutation | Arguments | Description |
|----------|-----------|-------------|
| `createAppointment` | `doctorId`, `startTime`, `durationMinutes?`, `notes?` | Books a new appointment; prevents double-booking |
| `cancelAppointment` | `id` | Cancels an appointment owned by the patient |
| `rescheduleAppointment` | `id`, `newStartTime`, `newDurationMinutes?` | Moves an appointment to a new date/time |
| `changeDoctor` | `id`, `newDoctorId` | Reassigns an appointment to a different doctor |

---

## Design Assets

Should you choose to do the mobile app, UI mockups are provided for reference — you are expected to match the designs.
- `design/mobile/` — Mobile layouts (< 768px)

---

## Accessibility Requirements

- The booking modal must **trap focus** — Tab cycles only within the open modal; Escape closes it
- All form inputs must have a visible, associated `<label>`
- Doctor cards and time slot buttons must be keyboard-selectable (Enter/Space)
- Loading and error states must use appropriate ARIA attributes for screen readers
- All interactive elements must have a minimum touch target of 44×44px on mobile

---

## Running Tests

```bash
make test            # Run all tests (backend + frontend)
make test-backend    # Backend only
make test-frontend   # Frontend only
```

> **Note:** `make test-frontend` runs locally via `npm run test:run` — no Docker required.
> `make test-backend` and `make test` require Docker to be running (`make start` first).

### Existing Frontend tests
- Framework: **Vitest** + **React Testing Library**
- Located in `frontend/src/**/__tests__/`
- All bug fixes have corresponding test cases — green tests = correct fix

### Backend tests
- Framework: **pytest**
- Located in `backend/src/tests/`
- Covers all GraphQL mutations and queries including `rescheduleAppointment` and `changeDoctor`

---

## Deliverables

- Committed changes
- E3E testing with Playwright
- Brief notes on any key architectural decisions you made
