import { useState, useEffect, useRef } from 'react'
import TimeSlotSelectionModal from './TimeSlotSelectionModal'
import './ModalStyles.css'
import './BookAppointmentModal.css'
import { Calendar, TimeSlotGrid } from '../ui'
import useDoctorAvailability from '../../hooks/useDoctorAvailability'
import { calculateTimeSlotAvailability } from '../../lib/timeSlotUtils'

import type { Doctor, Appointment } from '../../types/index.types'

type BookAppointmentModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccessBooked: () => void
  appointments: Appointment[]
  doctors: Doctor[]
}

export default function BookAppointmentModal({ isOpen, onClose, onSuccessBooked, appointments, doctors }: BookAppointmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const { availability } = useDoctorAvailability(selectedDoctor?.id || null, selectedDate)
  const selectedDoctorAppointments = appointments.filter(apt => apt.doctorId === selectedDoctor?.id)
  const slots = calculateTimeSlotAvailability(selectedDoctorAppointments, availability, selectedDate)
  const getdDoctorsSpecialty = [...new Set(doctors.map(doc => doc.specialty))]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = selectedSpecialty ? doctor.specialty === selectedSpecialty : true
    return matchesSearch && matchesSpecialty
  })

  useEffect(() => {
    if (showCalendar && calendarRef.current) {
      calendarRef.current.scrollTo({
        top: calendarRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [showCalendar])

  const handleToggleCalendar = () => {
    setShowCalendar((prev) => !prev)

  }

  // Clear search and selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedSpecialty('')
      setSelectedDoctor(null)
      setShowTimeSlotModal(false)
    }
  }, [isOpen])

  // clear all state when search query or specialty changes
  useEffect(() => {
    setSelectedDoctor(null)
    setShowTimeSlotModal(false)
    setSelectedDate(null)
  }, [searchQuery, selectedSpecialty])

  // In production, this would be fetched from the backend
  const specialties = ['All Specialties', ...getdDoctorsSpecialty]

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
  }

  const handleNext = () => {
    if (selectedDoctor) {
      setShowTimeSlotModal(true)
    }
  }

  const handleTimeSlotBack = () => {
    setShowTimeSlotModal(false)
  }

  const handleTimeSlotConfirm = () => {
    setShowTimeSlotModal(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container book-appointment-modal">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">New Appointment</h2>
            <p className="modal-subtitle">Step 1 of 2: Choose a doctor</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-content">
          <aside className="filter-sidebar" ref={calendarRef}>
            <h3 className="filter-title">Filter Doctors</h3>
            <div className="filter-controls">
              <div className="filter-group">
                <label className="filter-label" htmlFor="search">Search</label>
                <div className="search-input-wrapper">
                  <span className="search-icon material-symbols-outlined">search</span>
                  <input
                    id="search"
                    type="text"
                    placeholder="Doctor name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label" htmlFor="specialty">Specialty</label>
                <select
                  id="specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="specialty-select"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty === 'All Specialties' ? '' : specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="cta-show-calendar">
              <button className="btn-show-calendar" onClick={handleToggleCalendar}>
                Show Doctor Availability
              </button>
            </div>
            {showCalendar && <div className="date-selection">
              <h4 className="section-title">Select a Date</h4>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>}
          </aside>

          <main className="doctors-main">
            <h3 className="doctors-title">Available Doctors ({filteredDoctors.length})</h3>
            <div className="doctors-grid">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                  onClick={() => handleDoctorClick(doctor)}
                >
                  <div className="doctor-avatar">
                    {doctor.avatarUrl ? (
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.name}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-slate-800">{doctor.name}</h4>
                    <p className="text-sm text-slate-600">{doctor.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
            {(selectedDoctor && selectedDate && showCalendar) && <TimeSlotGrid slots={slots} onTimeSelect={() => {}} />}
          </main>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-next"
            onClick={handleNext}
            disabled={!selectedDoctor}
          >
            <span>Next: Choose Date & Time</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Time Slot Selection Modal */}
      {selectedDoctor && (
        <TimeSlotSelectionModal
          isOpen={showTimeSlotModal}
          onClose={handleTimeSlotConfirm}
          onBack={handleTimeSlotBack}
          selectedDoctor={selectedDoctor}
          onSuccessBooked={onSuccessBooked}
        />
      )}
    </div>
  )
}
