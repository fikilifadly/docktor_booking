import './ModalStyles.css'
import './AppointmentConfirmationModal.css'

import type { Doctor } from '../../types/index.types'

type AppointmentConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  doctor: Doctor
  date: Date
  time: string
}

export default function AppointmentConfirmationModal({
  isOpen,
  onClose,
  doctor,
  date,
  time
}: AppointmentConfirmationModalProps) {
  if (!isOpen) return null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container confirmation-modal">
        <div className="confirmation-content">
          <div className="success-icon">
            <span className="material-symbols-outlined">check</span>
          </div>
          <h2 className="confirmation-title">Appointment Confirmed</h2>
          <p className="confirmation-subtitle">
            Your appointment has been successfully booked.
          </p>
        </div>

        <div className="appointment-details">
          <div className="doctor-info">
            <div className="doctor-avatar">
              {doctor.avatarUrl ? (
                <img 
                  src={doctor.avatarUrl} 
                  alt={doctor.name}
                  className="doctor-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span className="material-symbols-outlined">person</span>
                </div>
              )}
            </div>
            <div className="doctor-details">
              <p className="doctor-name">{doctor.name}</p>
              <p className="doctor-specialty">{doctor.specialty}</p>
            </div>
          </div>
          
          <dl className="appointment-info">
            <div className="info-item">
              <dt className="info-label">Date</dt>
              <dd className="info-value">{formatDate(date)}</dd>
            </div>
            <div className="info-item">
              <dt className="info-label">Time</dt>
              <dd className="info-value">{time}</dd>
            </div>
          </dl>
        </div>

        <div className="confirmation-footer">
          <button 
            className="btn-done" 
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
