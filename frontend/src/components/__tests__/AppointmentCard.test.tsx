import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import AppointmentCard from '../AppointmentCard'

// Mock the useCancelAppointment hook
vi.mock('../../hooks/useCancelAppointment', () => ({
  useCancelAppointment: () => ({
    cancelAppointment: vi.fn().mockResolvedValue({ success: true }),
    loading: false
  })
}))

const mockAppointment = {
  id: 'appointment-1',
  doctorId: 'doctor-1',
  startTime: '2024-12-20T10:00:00Z',
  durationMinutes: 60,
  status: 'scheduled',
  notes: 'Regular checkup',
  createdAt: '2024-12-15T09:00:00Z',
  updatedAt: '2024-12-15T09:00:00Z'
}

const mockDoctor = {
  id: 'doctor-1',
  name: 'Dr. Amelia Chen',
  specialty: 'Internal Medicine',
  avatarUrl: 'https://example.com/doctor1.jpg'
}

describe('AppointmentCard', () => {
  it('renders appointment information correctly', () => {
    render(<AppointmentCard appointment={mockAppointment} doctor={mockDoctor} />)
    
    expect(screen.getByText('Dr. Amelia Chen')).toBeInTheDocument()
    expect(screen.getByText('Internal Medicine')).toBeInTheDocument()
    expect(screen.getByText('Friday, December 20, 2024')).toBeInTheDocument()
    expect(screen.getByText('5:00 PM')).toBeInTheDocument()
    expect(screen.getByText('60 minutes')).toBeInTheDocument()
    expect(screen.getByText('Regular checkup')).toBeInTheDocument()
    expect(screen.getByText('Scheduled')).toBeInTheDocument()
  })

  it('shows cancel button for scheduled appointments', () => {
    render(<AppointmentCard appointment={mockAppointment} doctor={mockDoctor} />)
    
    expect(screen.getByText('Cancel Appointment')).toBeInTheDocument()
  })

  it('does not show cancel button for cancelled appointments', () => {
    const cancelledAppointment = { ...mockAppointment, status: 'cancelled' }
    render(<AppointmentCard appointment={cancelledAppointment} doctor={mockDoctor} />)
    
    expect(screen.queryByText('Cancel Appointment')).not.toBeInTheDocument()
  })

  it('shows confirmation dialog when cancel is clicked', async () => {
    render(<AppointmentCard appointment={mockAppointment} doctor={mockDoctor} />)
    
    const cancelButton = screen.getByText('Cancel Appointment')
    fireEvent.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to cancel this appointment?')).toBeInTheDocument()
      expect(screen.getByText('Keep Appointment')).toBeInTheDocument()
      expect(screen.getByText('Yes, Cancel')).toBeInTheDocument()
    })
  })

  it('handles appointment without doctor info', () => {
    render(<AppointmentCard appointment={mockAppointment} />)
    
    expect(screen.getByText('Doctor doctor-1')).toBeInTheDocument()
  })

  it('handles appointment without notes', () => {
    const appointmentWithoutNotes = { ...mockAppointment, notes: null }
    render(<AppointmentCard appointment={appointmentWithoutNotes} doctor={mockDoctor} />)
    
    // Should not show notes section
    expect(screen.queryByText('Notes:')).not.toBeInTheDocument()
  })
})
