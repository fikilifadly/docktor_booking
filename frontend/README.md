# HealthPlus Frontend - React + TypeScript + Vite

A modern appointment booking system built with React, TypeScript, and Vite, featuring a modular component architecture and comprehensive testing infrastructure.

## Technical Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **GraphQL** - Efficient data fetching with typed queries and mutations
- **JWT Authentication** - Secure token-based authentication
- **React Testing Library** - Component testing utilities
- **MSW (Mock Service Worker)** - GraphQL/REST API mocking
- **Vitest** - Fast testing framework with Vite integration

## Architecture Decisions

### Component-Based Architecture
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: UIs built by combining several components
- **Separation of Concerns**: Layout, styling, and business logic are separated
- **DRY Principle**: Common patterns used as reusable components

### Modular Design Principles
- **Feature-Based Structuralization**: Related components grouped by functionality
- **Custom Hooks**: Business logic extracted into reusable hooks
- **Context-Based State**: Authentication and global state management
- **Contract-First**: Follows backend API contract for all API calls

## Project Structure

```
frontend/src/
├── components/
│   ├── layout/           # Reusable layout components (PageLayout, Card, PageContainer)
│   ├── ui/              # UI components (Input, Button, Calendar, TimeSlotGrid)
│   ├── modals/          # Modal components (BookAppointment, TimeSlot, Confirmation)
│   └── AppointmentCard.tsx
├── features/
│   └── appointments/     # Feature-specific components and hooks
├── pages/               # Page components (LoginPage, AppointmentsPage)
├── auth/                # Authentication context and hooks
├── lib/                 # Utilities and API clients
├── hooks/               # Global custom hooks
└── routes/              # Routing configuration
```

## Application Flow

### Authentication Flow
```
LoginPage → AuthContext → localStorage (token) → http.ts (Bearer token) → GraphQL API
```

### Data Flow
```
AppointmentsPage → Custom Hooks → GraphQL Queries → Backend API → Real-time Updates
```

### Booking Flow
```
AppointmentsPage → BookAppointmentModal → TimeSlotSelectionModal → AppointmentConfirmationModal
```

## Key Components

### Layout System
- **PageLayout**: Main page wrapper with optional header
- **Card**: Reusable content containers with variants (default, empty, login)
- **PageContainer**: Content wrapper with max-width and padding

### UI Components
- **Input**: Enhanced form input with validation and error states
- **Button**: Interactive button with loading states and variants
- **Calendar**: Date picker with month navigation and past date prevention
- **TimeSlotGrid**: Smart time selection with availability indicators

### Modal System
- **BookAppointmentModal**: Doctor selection interface
- **TimeSlotSelectionModal**: Date and time selection
- **AppointmentConfirmationModal**: Success confirmation

## State Management

### Custom Hooks Architecture
- **useAuth**: JWT token handling with localStorage persistence
- **useForm**: Centralized form state management
- **useBookAppointment**: Appointment booking logic with GraphQL integration
- **useCancelAppointment**: Appointment cancellation with confirmation
- **useAppointments**: Real-time appointment data management
- **useDoctors**: Doctor data with search and filter functionality
- **useTimeSlotAvailability**: Smart time slot calculation

### Context-Based State
- **AuthContext**: Global authentication state
- **Automatic token validation** and redirect handling
- **Real-time data synchronization** after mutations

## Styling Strategy

### CSS Organization
1. **Global Styles** (`index.css`): CSS variables, base styles, typography
2. **Layout Styles** (`components/layout/*.css`): Reusable layout components
3. **Component Styles** (`components/ui/*.css`): UI component styles
4. **Page Styles** (`pages/*/styles.css`): Page-specific styles only

### Design System
```css
:root {
  --color-primary: #1877F2;
  --color-background-light: #F0F2F5;
  --color-card-light: #FFFFFF;
  --color-text-light: #1C1E21;
  --color-border-light: #DADDE1;
}
```

## Testing Strategy

### Test Categories
- **Unit Tests**: Individual components and functions
- **Integration Tests**: Multi-component workflows with MSW mocking
- **Hook Tests**: Custom logic and state management

### Testing Infrastructure
- **React Testing Library**: Component testing utilities
- **MSW**: GraphQL/REST API mocking for realistic testing
- **Vitest**: Fast testing framework with Vite integration
- **19 tests** across components, hooks, and integration flows

## Key Features

### Complete Appointment System
- **Multi-step booking flow**: Doctor selection → Date/Time → Confirmation
- **Real-time doctor search** with specialty filtering
- **Smart time slot availability** with conflict detection
- **Appointment management**: View, cancel, and manage appointments
- **Responsive design** optimized for all devices

### Enhanced User Experience
- **Authentication system** with JWT token management
- **Loading states** with visual indicators
- **Error handling** with user-friendly messages
- **Accessibility** with proper ARIA attributes
- **Real-time updates** after mutations

## Development Commands

### Project-Level Commands (Recommended)
```bash
# Start all services (backend + frontend + database)
make start

# Run all tests (backend + frontend)
make test

# Run frontend tests only
make test-frontend

# Stop all services
make stop

# Clean up everything
make clean
```

### Frontend-Only Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test        # Watch mode
npm run test:run    # CI mode
npm run test:ui     # Visual UI
```

## Benefits Achieved

### Developer Experience
- **Type Safety**: Full TypeScript support with proper typing
- **Component Reusability**: Write once, use everywhere
- **Clear Architecture**: Easy to understand and maintain
- **Hot Reload**: Fast development with Vite

### User Experience
- **Consistent Interface**: Uniform design across all pages
- **Responsive Design**: Works on all device sizes
- **Performance**: Optimized loading and smooth interactions
- **Accessibility**: Screen reader friendly with proper ARIA labels

### Maintainability
- **Modular Design**: Changes in one place affect the whole app
- **Clear Separation**: Layout, styling, and logic are separated
- **Scalable Architecture**: Easy to add new features
- **Comprehensive Testing**: Reliable code with good test coverage

This architecture provides a solid foundation for building modern, maintainable React applications while keeping the codebase simple and understandable.