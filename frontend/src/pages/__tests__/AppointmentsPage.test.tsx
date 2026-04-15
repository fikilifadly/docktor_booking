// FE-005: Stale Data After Cancel
// FE-006: No Logout Confirmation
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import AppointmentsPage from '../AppointmentsPage'

const mockRefetch = vi.fn()
const mockCancelAppointment = vi.fn()
const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../features/appointments/hooks/useAppointments', () => ({
  useAppointments: () => ({
    loading: false,
    error: null,
    appointments: [
      {
        id: 'appt-1',
        doctorId: 'doctor-1',
        startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        durationMinutes: 60,
        status: 'scheduled',
        notes: 'Checkup',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    refetch: mockRefetch,
  }),
}))

vi.mock('../../features/appointments/hooks/useDoctors', () => ({
  useDoctors: () => ({ doctors: [] }),
}))

vi.mock('../../hooks/useCancelAppointment', () => ({
  useCancelAppointment: () => ({
    cancelAppointment: mockCancelAppointment,
    loading: false,
  }),
}))

vi.mock('../../auth/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
    patient: { id: 'patient-1', email: 'test@example.com' },
    token: 'mock-token',
    isAuthenticated: true,
  }),
}))

// BookAppointmentModal is out of scope here — render a no-op stub
vi.mock('../../components', async () => {
  const actual = await vi.importActual<typeof import('../../components')>('../../components')
  return { ...actual, BookAppointmentModal: () => null }
})

describe('AppointmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  // FE-005: refetch() must be called after successful cancellation
  it('calls refetch after a successful appointment cancellation', async () => {
    mockCancelAppointment.mockResolvedValue({ success: true })

    render(<AppointmentsPage />)

    const cancelBtn = screen.getByText('Cancel')
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(mockCancelAppointment).toHaveBeenCalledWith('appt-1')
      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  it('does not call refetch when cancellation fails', async () => {
    mockCancelAppointment.mockResolvedValue({ success: false, error: 'Server error' })
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<AppointmentsPage />)

    fireEvent.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(mockCancelAppointment).toHaveBeenCalled()
      expect(mockRefetch).not.toHaveBeenCalled()
    })
  })

  // FE-006: logout must show a confirmation dialog before logging out
  it('shows a confirm dialog before logging out', () => {
    render(<AppointmentsPage />)

    fireEvent.click(screen.getByText('Logout'))

    expect(window.confirm).toHaveBeenCalled()
  })

  it('logs out and navigates when the user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<AppointmentsPage />)

    fireEvent.click(screen.getByText('Logout'))

    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('does not log out when the user dismisses the confirm dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<AppointmentsPage />)

    fireEvent.click(screen.getByText('Logout'))

    expect(mockLogout).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
