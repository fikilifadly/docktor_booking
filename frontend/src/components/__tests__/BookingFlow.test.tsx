import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import TimeSlotSelectionModal from '../modals/TimeSlotSelectionModal'

// Mock the current time to be 10:00 AM so time slots are available
const mockDate = new Date()
vi.setSystemTime(mockDate)

// Mock the useBookAppointment hook
const mockBookAppointment = vi.fn()
vi.mock('../../hooks/useBookAppointment', () => ({
  useBookAppointment: () => ({
    bookAppointment: mockBookAppointment,
    loading: false,
    error: ''
  })
}))

// Mock the useAppointmentsByDoctor hook
vi.mock('../../hooks/useAppointmentsByDoctor', () => ({
  useAppointmentsByDoctor: () => ({
    appointments: [],
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}))

const mockDoctor = {
  id: 'doctor-1',
  name: 'Dr. Amelia Chen',
  specialty: 'Internal Medicine',
  avatarUrl: 'https://example.com/doctor1.jpg'
}

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete the booking flow successfully', async () => {
    mockBookAppointment.mockResolvedValue({ success: true, appointmentId: 'appointment-1' })

    render(
      <TimeSlotSelectionModal
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
        selectedDoctor={mockDoctor}
      />
    )

    // Check that the modal is open
    expect(screen.getByText('New Appointment')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 2: Choose date & time')).toBeInTheDocument()

    // Check doctor information is displayed
    expect(screen.getByText('Dr. Amelia Chen')).toBeInTheDocument()
    expect(screen.getByText('Internal Medicine')).toBeInTheDocument()

    // Check that calendar and time slots are rendered
    expect(screen.getByText('Select a Date')).toBeInTheDocument()
    expect(screen.getByText('Choose a Time')).toBeInTheDocument()

    // Select tomorrow's date (27th) which should be available
    const tomorrowButton = screen.getByText('27')
    fireEvent.click(tomorrowButton)

    // Select a time slot (use 11:00 AM which should be available at 10:00 AM)
    const timeSlot = screen.getByText('11:00 AM')
    fireEvent.click(timeSlot)

    // Now the confirm button should be enabled
    const confirmButton = screen.getByText('Create Appointment')
    expect(confirmButton).not.toBeDisabled()

    // Click confirm button
    fireEvent.click(confirmButton)

    // Wait for the booking to complete
    await waitFor(() => {
      expect(mockBookAppointment).toHaveBeenCalledWith({
        doctor: mockDoctor,
        date: expect.any(Date),
        time: '11:00 AM'
      })
    })
  })

  it('should handle booking errors', async () => {
    mockBookAppointment.mockResolvedValue({ 
      success: false, 
      error: 'Slot already booked for this doctor' 
    })

    render(
      <TimeSlotSelectionModal
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
        selectedDoctor={mockDoctor}
      />
    )

    // Select tomorrow's date (27th) which should be available
    const tomorrowButton = screen.getByText('27')
    fireEvent.click(tomorrowButton)
    
    const timeSlot = screen.getByText('11:00 AM')
    fireEvent.click(timeSlot)

    // Click confirm button
    const confirmButton = screen.getByText('Create Appointment')
    fireEvent.click(confirmButton)

    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByText('Slot already booked for this doctor')).toBeInTheDocument()
    })
  })

  it('should disable confirm button when no date or time is selected', () => {
    render(
      <TimeSlotSelectionModal
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
        selectedDoctor={mockDoctor}
      />
    )

    const confirmButton = screen.getByText('Create Appointment')
    expect(confirmButton).toBeDisabled()
  })

  it('should enable confirm button when both date and time are selected', () => {
    render(
      <TimeSlotSelectionModal
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
        selectedDoctor={mockDoctor}
      />
    )

    // Select tomorrow's date (27th) which should be available
    const tomorrowButton = screen.getByText('27')
    fireEvent.click(tomorrowButton)

    // Select a time slot (use 11:00 AM which should be available at 10:00 AM)
    const timeSlot = screen.getByText('11:00 AM')
    fireEvent.click(timeSlot)

    const confirmButton = screen.getByText('Create Appointment')
    expect(confirmButton).not.toBeDisabled()
  })
})
