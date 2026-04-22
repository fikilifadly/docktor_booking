import { useRef } from 'react'
import type { Doctor } from '../../types/index.types'
import './ChangeDoctorModal.css'

interface ChangeDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (doctorId: string) => void
  availableDoctors: Doctor[]
  currentDoctorName: string
}

const ChangeDoctorModal = ({
  isOpen,
  onClose,
  onConfirm,
  availableDoctors,
  currentDoctorName,
}: ChangeDoctorModalProps) => {
  const doctorsRef = useRef<HTMLSelectElement>(null)

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Change Appointment</h2>

        <p className="current-doctor">
          Current Doctor: <strong>{currentDoctorName}</strong>
        </p>

        <label>
          Select New Doctor:
          <select ref={doctorsRef} defaultValue="">
            <option value="" disabled>
              Select doctor
            </option>
            {availableDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              const selectedId = doctorsRef.current?.value
              if (!selectedId) return
              onConfirm(selectedId)
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChangeDoctorModal