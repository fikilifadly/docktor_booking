import { useState, useEffect } from 'react'
import Calendar from '../ui/Calendar'
import TimeSlotGrid from '../ui/TimeSlotGrid'
import AppointmentConfirmationModal from './AppointmentConfirmationModal'
import { useBookAppointment } from '../../hooks/useBookAppointment'
import { useAppointmentsByDoctor } from '../../hooks/useAppointmentsByDoctor'
import { calculateTimeSlotAvailability } from '../../lib/timeSlotUtils'
import './ModalStyles.css'
import './TimeSlotSelectionModal.css'

type Doctor = {
  id: string
  name: string
  specialty: string
  avatarUrl?: string | null
}

type TimeSlotSelectionModalProps = {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  selectedDoctor: Doctor
  onSuccessBooked: () => void
}

export default function TimeSlotSelectionModal({
  isOpen,
  onClose,
  onBack,
  selectedDoctor,
  onSuccessBooked,
}: TimeSlotSelectionModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingError, setBookingError] = useState<string>('')
  const { bookAppointment, loading } = useBookAppointment()
  
  // Fetch appointments for the selected doctor and date
  const { 
    appointments, 
    loading: appointmentsLoading, 
    error: appointmentsError, 
    refetch
  } = useAppointmentsByDoctor(selectedDoctor.id, selectedDate)
  
  // Calculate available time slots
  const timeSlots = calculateTimeSlotAvailability(appointments, selectedDate)
  
  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime(null)
  }, [selectedDate])

  const handleConfirm = async () => {
    if (selectedDate && selectedTime) {
      setBookingError('')
      const result = await bookAppointment({
        doctor: selectedDoctor,
        date: selectedDate,
        time: selectedTime
      })
      
      if (result.success) {
        onSuccessBooked()
        setShowConfirmation(true)
      } else {
        setBookingError(result.error || 'Failed to book appointment')
      }
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    setSelectedDate(null)
    setSelectedTime(null)
    refetch()
    onClose() // This will close the TimeSlotSelectionModal
    // The parent BookAppointmentModal will also close via its handleTimeSlotConfirm
  }

  const handleClose = () => {
    setSelectedDate(null)
    setSelectedTime(null)
    onClose()
  }

  const handleBack = () => {
    setSelectedDate(null)
    setSelectedTime(null)
    onBack()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className={`modal-container time-slot-modal ${showConfirmation ? 'hidden' : ''}`}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">New Appointment</h2>
            <p className="modal-subtitle">Step 2 of 2: Choose date & time</p>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-content">
          {/* Doctor Info - Centered above date/time picker */}
          <div className="doctor-info-section">
            <div className="doctor-avatar">
              {selectedDoctor.avatarUrl ? (
                <img 
                  src={selectedDoctor.avatarUrl} 
                  alt={selectedDoctor.name}
                  className="doctor-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span className="material-symbols-outlined">person</span>
                </div>
              )}
            </div>
            <div className="doctor-details">
              <h3 className="doctor-name">{selectedDoctor.name}</h3>
              <p className="doctor-specialty">{selectedDoctor.specialty}</p>
            </div>
          </div>

          {/* Error message for appointments loading failure */}
          {appointmentsError && (
            <div className="error-message">
              <span className="material-symbols-outlined">error</span>
              Unable to load appointment availability. Please try again.
              <button 
                onClick={refetch}
                className="retry-button"
                style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Date and Time Selection */}
          <div className="selection-grid">
            <div className="date-selection">
              <h4 className="section-title">Select a Date</h4>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>
            
            <div className="time-selection">
              <h4 className="section-title">Choose a Time</h4>
              {appointmentsLoading ? (
                <div className="loading-message">
                  <span className="material-symbols-outlined">schedule</span>
                  Loading available times...
                </div>
              ) : (
                <TimeSlotGrid
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                  slots={timeSlots}
                />
              )}
            </div>
          </div>
        </div>

        {bookingError && (
          <div className="error-message">
            <span className="material-symbols-outlined">error</span>
            {bookingError}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-back" onClick={handleBack} disabled={loading || appointmentsLoading}>
            Back
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || loading || appointmentsLoading || !!appointmentsError}
          >
            {loading ? 'Booking...' : appointmentsLoading ? 'Loading...' : 'Create Appointment'}
          </button>
        </div>
      </div>

      {/* Appointment Confirmation Modal */}
      {selectedDate && selectedTime && (
        <AppointmentConfirmationModal
          isOpen={showConfirmation}
          onClose={handleConfirmationClose}
          doctor={selectedDoctor}
          date={selectedDate}
          time={selectedTime}
        />
      )}
    </div>
  )
}
