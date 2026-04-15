import { graphql, http } from 'msw'

// Mock data
const mockPatient = {
  id: 'patient-1',
  email: 'test@example.com'
}

const mockDoctors = [
  {
    id: 'doctor-1',
    name: 'Dr. Amelia Chen',
    specialty: 'Internal Medicine',
    avatarUrl: 'https://example.com/doctor1.jpg'
  },
  {
    id: 'doctor-2',
    name: 'Dr. John Smith',
    specialty: 'Cardiology',
    avatarUrl: null
  }
]

const mockAppointments = [
  {
    id: 'appointment-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    startTime: '2024-12-20T10:00:00Z',
    durationMinutes: 60,
    status: 'scheduled',
    notes: 'Regular checkup',
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-15T09:00:00Z'
  }
]

export const handlers = [
  // Login endpoint
  http.post('http://localhost:8000/auth/login', () => {
    return new Response(
      JSON.stringify({
        token: 'mock-jwt-token',
        patient: mockPatient
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }),

  // GraphQL endpoint
  graphql.operation((req, res, ctx) => {
    const { operationName } = req.variables

    switch (operationName) {
      case 'Doctors':
        return res(
          ctx.data({
            doctors: mockDoctors
          })
        )

      case 'AppointmentsByPatient':
        return res(
          ctx.data({
            appointmentsByPatient: mockAppointments
          })
        )

      case 'CreateAppointment':
        const newAppointment = {
          id: 'appointment-new',
          patientId: 'patient-1',
          doctorId: req.variables.doctorId,
          startTime: req.variables.startTime,
          durationMinutes: req.variables.durationMinutes || 60,
          status: 'scheduled',
          notes: req.variables.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        return res(
          ctx.data({
            createAppointment: {
              ok: true,
              appointment: newAppointment
            }
          })
        )

      case 'CancelAppointment':
        return res(
          ctx.data({
            cancelAppointment: {
              ok: true
            }
          })
        )

      default:
        return res(
          ctx.errors([
            {
              message: `Unknown operation: ${operationName}`
            }
          ])
        )
    }
  })
]
