# Frontend Testing Strategy

## Overview

This document describes our testing approach for the React + TypeScript appointment booking frontend. We use both **unit tests** and **integration tests** to ensure component functionality and user workflows work correctly.

## Test Types

### Unit Tests
**Purpose**: Test individual components and functions in isolation.

**What We Test**:
- Component rendering and props handling
- User interactions (clicks, form inputs)
- Custom hooks and utility functions
- Component state management

**Strategy**: 
- Mock external dependencies (API calls, context)
- Fast execution (no real API calls)
- High coverage of component logic

### Integration Tests
**Purpose**: Test complete user workflows with mocked API interactions.

**What We Test**:
- Multi-component interactions
- API integration workflows
- User journey completion
- Data flow between components

**Strategy**:
- MSW (Mock Service Worker) for API mocking
- React Testing Library for DOM interactions
- Real component rendering and state

## Test Categories

### 1. Component Tests (`components/__tests__/`)
**Type**: Unit Tests

**Tests**:
- `AppointmentCard.test.tsx`: Individual appointment card rendering
- `BookingFlow.test.tsx`: Booking modal component logic

### 2. Hook Tests (`hooks/__tests__/`)
**Type**: Unit Tests

**Tests**:
- `useAuth.test.tsx`: Authentication hook functionality
- `useBookAppointment.test.tsx`: Booking hook logic

### 3. Integration Tests (`src/tests/`)
**Type**: Integration Tests

**Tests**:
- `AppointmentsPage Test`: **Appointments Page Loading Test**
  - Renders appointments page
  - Waits for GraphQL query completion
  - Verifies appointments are displayed correctly
- `Book Appointment Modal Test`: **Complete Booking Workflow Test**
  - Renders appointments page
  - Opens booking modal
  - Selects doctor and time slot
  - Submits appointment
  - Verifies successful creation

## Test Architecture

### MSW (Mock Service Worker) Setup
```typescript
// src/test/mocks/handlers.ts
export const handlers = [
  graphql.query('AppointmentsByPatient', (req, res, ctx) => {
    return res(ctx.data({
      appointmentsByPatient: mockAppointments
    }))
  }),
  graphql.mutation('CreateAppointment', (req, res, ctx) => {
    return res(ctx.data({
      createAppointment: { ok: true, appointment: mockAppointment }
    }))
  })
]
```

### Test Utilities
```typescript
// src/test/utils.tsx
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthProvider>
  )
}
```

### API Mocking Strategy
- **GraphQL Queries**: Mocked with realistic data
- **Authentication**: Mocked JWT tokens and user context
- **Error Scenarios**: Network errors and API failures
- **Loading States**: Async operation simulation

## Running Tests

### Project-Level Commands (Recommended)
```bash
# Run all tests (backend + frontend)
make test

# Run frontend tests only
make test-frontend

# Start all services
make start

# Stop all services
make stop

# Clean up everything
make clean
```

### Frontend-Only Commands
```bash
# Run all frontend tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test AppointmentCard.test.tsx
```

## Test Data

### Mock Appointments
```typescript
const mockAppointments = [
  {
    id: "apt-1",
    doctorId: "dr_house",
    startTime: "2024-01-15T10:00:00Z",
    durationMinutes: 60,
    status: "scheduled"
  }
]
```

### Mock Doctors
```typescript
const mockDoctors = [
  { id: "dr_house", name: "Dr. House", specialty: "Internal Medicine" },
  { id: "dr_strange", name: "Dr. Strange", specialty: "Neurology" }
]
```

### Mock Time Slots
```typescript
const mockTimeSlots = [
  "2024-01-15T09:00:00Z",
  "2024-01-15T10:00:00Z",
  "2024-01-15T11:00:00Z"
]
```

## Test Requirements Fulfilled

### AppointmentsPage Test
✅ **Render appointments page** - Component mounting and rendering  
✅ **Wait for GraphQL query** - Async data loading simulation  
✅ **Verify appointments rendered** - Data display validation  

### Book Appointment Modal Test
✅ **Render appointments page** - Initial page setup  
✅ **Open booking modal** - Modal state management  
✅ **Select doctor** - Doctor selection interaction  
✅ **Select time slot** - Time slot selection logic  
✅ **Submit appointment** - Form submission workflow  
✅ **Verify creation** - Success state validation  

## Key Benefits

✅ **Realistic Testing**: MSW provides authentic API mocking  
✅ **User-Centric**: Tests focus on user interactions and workflows  
✅ **Fast Execution**: No real API calls or network delays  
✅ **Reliable**: Consistent test data and predictable outcomes  
✅ **Maintainable**: Clear test structure and reusable utilities