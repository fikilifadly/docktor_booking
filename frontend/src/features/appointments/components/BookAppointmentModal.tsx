import { useState, useEffect } from 'react'
import { useDoctors } from '../hooks/useDoctors'
import { TimeSlotSelectionModal } from '../../../components/modals'
import './BookAppointmentModal.css'

type Doctor = {
  id: string
  name: string
  specialty: string
  avatarUrl?: string | null
}

type BookAppointmentModalProps = {
  isOpen: boolean
  onClose: () => void
  onDoctorSelect: (doctor: Doctor) => void
}

export default function BookAppointmentModal({ isOpen, onClose, onDoctorSelect }: BookAppointmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)

  const { loading, error, doctors } = useDoctors(
    searchQuery || undefined,
    selectedSpecialty || undefined
  )


  // Clear search and selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedSpecialty('')
      setSelectedDoctor(null)
      setShowTimeSlotModal(false)
    }
  }, [isOpen])

  // In production, this would be fetched from the backend
  const specialties = ['All Specialties', 'Neurology', 'Diagnostics', 'Pediatrician', 'Dermatology', 'Family Medicine']

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
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New Appointment</h2>
            <p className="modal-subtitle">Step 1 of 2: Choose a doctor</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-content">
          <aside className="filter-sidebar">
            <h3 className="filter-title">Filter Doctors</h3>
            <div className="filter-controls">
              <div className="filter-group">
                <label className="filter-label" htmlFor="search">Search</label>
                <div className="search-input-wrapper">
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
          </aside>

          <main className="doctors-main">
            <h3 className="doctors-title">Available Doctors ({doctors.length})</h3>
            {loading && <div>Loading doctors...</div>}
            {error && <div className="error" role="alert">{error}</div>}
            <div className="doctors-grid">
              {doctors.map((doctor) => (
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
                  <div className="doctor-info">
                    <h4 className="doctor-name">{doctor.name}</h4>
                    <p className="doctor-specialty">{doctor.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
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
        />
      )}
    </div>
  )
}
