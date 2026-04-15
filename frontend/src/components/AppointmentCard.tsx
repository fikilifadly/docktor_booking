import { useState } from 'react'
import { useCancelAppointment } from '../hooks/useCancelAppointment'
import './AppointmentCard.css'

type Appointment = {
  id: string
  doctorId: string
  startTime: string
  durationMinutes: number
  status: string
  notes?: string | null
  createdAt: string
  updatedAt: string
}

type Doctor = {
  id: string
  name: string
  specialty: string
  avatarUrl?: string | null
}

type AppointmentCardProps = {
  appointment: Appointment
  doctor?: Doctor
  onCancel?: () => void
}

export default function AppointmentCard({ appointment, doctor, onCancel }: AppointmentCardProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const { cancelAppointment, loading } = useCancelAppointment()

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const handleCancel = async () => {
    const result = await cancelAppointment(appointment.id)
    if (result.success) {
      setShowCancelConfirm(false)
      onCancel?.()
    } else {
      alert(`Failed to cancel appointment: ${result.error}`)
    }
  }

  const { date, time } = formatDateTime(appointment.startTime)
  const isCancelled = appointment.status === 'cancelled'

  return (
    <div className={`appointment-card ${isCancelled ? 'cancelled' : ''}`}>
      <div className="appointment-content">
        <div className="appointment-info">
          <div className="appointment-header">
            <h3 className="appointment-doctor">
              {doctor ? doctor.name : `Doctor ${appointment.doctorId}`}
            </h3>
            {doctor && (
              <p className="appointment-specialty">{doctor.specialty}</p>
            )}
          </div>
          
          <div className="appointment-details">
            <div className="appointment-detail">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{date}</span>
            </div>
            <div className="appointment-detail">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{time}</span>
            </div>
            <div className="appointment-detail">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{appointment.durationMinutes} minutes</span>
            </div>
            {appointment.notes && (
              <div className="appointment-detail">
                <span className="detail-label">Notes:</span>
                <span className="detail-value">{appointment.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="appointment-status">
          <span className={`status-badge ${appointment.status}`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
      </div>

      {!isCancelled && (
        <div className="appointment-actions">
          <button 
            className="btn-cancel"
            onClick={() => setShowCancelConfirm(true)}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Appointment'}
          </button>
        </div>
      )}

      {showCancelConfirm && (
        <div className="cancel-confirmation">
          <p>Are you sure you want to cancel this appointment?</p>
          <div className="confirmation-actions">
            <button 
              className="btn-secondary"
              onClick={() => setShowCancelConfirm(false)}
            >
              Keep Appointment
            </button>
            <button 
              className="btn-danger"
              onClick={handleCancel}
              disabled={loading}
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
