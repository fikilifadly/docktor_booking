import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppointments } from '../../features/appointments/hooks/useAppointments'
import { useDoctors } from '../../features/appointments/hooks/useDoctors'
import { useCancelAppointment } from '../../hooks/useCancelAppointment'
import { BookAppointmentModal } from '../../components'
import { PageLayout, PageContainer } from '../../components/layout'
import { useAuth } from '../../auth/useAuth'
import './styles.css'

export default function AppointmentsPage() {
  const { loading, error, appointments, refetch } = useAppointments()
  const { doctors } = useDoctors()
  const { cancelAppointment, loading: cancelLoading } = useCancelAppointment()
  const { logout, patient } = useAuth()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCancelled, setShowCancelled] = useState(false)

  const upcomingAppointments = appointments.filter(apt => apt.status !== 'cancelled')
  const hasUpcomingAppointments = upcomingAppointments.length > 0
  const hasAnyAppointments = appointments.length > 0

  // Create a mapping from doctorId to doctor information
  const doctorMap = useMemo(() => {
    const map = new Map()
    doctors.forEach(doctor => {
      map.set(doctor.id, doctor)
    })
    return map
  }, [doctors])

  const handleBookAppointment = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleDoctorSelect = (doctor: any) => {
    console.log('Selected doctor:', doctor)
    // This is now handled by the modal flow
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAppointmentCancel = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      const result = await cancelAppointment(appointmentId)
      if (result.success) {
        // refetch()
      } else {
        alert(`Failed to cancel appointment: ${result.error}`)
      }
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const headerActions = (
    <button className="btn-logout" onClick={handleLogout}>
      <span className="material-symbols-outlined">logout</span>
      Logout
    </button>
  )

  return (
    <PageLayout showHeader headerTitle="HealthPlus" headerActions={headerActions}>
      <PageContainer>
        <div className="appts-header-row">
          <div>
            <h1 className="appts-title">Upcoming Appointments</h1>
            <p className="appts-subtitle">Here are your scheduled appointments.</p>
          </div>
          <div className="appts-actions">
            <button className="appts-cta" onClick={handleBookAppointment}>Book an Appointment</button>
          </div>
        </div>

        {loading && <div className="loading-message">Loading appointments…</div>}
        {error && <div className="error-message" role="alert">{error}</div>}

        {!loading && !error && !hasUpcomingAppointments && (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-state-image">
                <div className="placeholder-image">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
              </div>
              <h3 className="empty-state-title">No upcoming appointments</h3>
              <p className="empty-state-subtitle">You don't have any upcoming appointments. Book one now.</p>
            </div>
          </div>
        )}

        {!loading && !error && hasAnyAppointments && (
          <div className="appointments-sections">
            {/* Upcoming Appointments */}
            {appointments.filter(apt => apt.status !== 'cancelled').length > 0 && (
              <div className="appointments-section">
                <h2 className="section-title">Scheduled Appointments</h2>
                <div className="appointments-container">
                  <div className="appointments-list">
                    {appointments
                      .filter(appointment => appointment.status !== 'cancelled')
                      .map((appointment) => {
                        const { date, time } = formatDateTime(appointment.startTime)
                        const doctor = doctorMap.get(appointment.doctorId)
                        
                        return (
                          <div key={appointment.id} className="appointment-row">
                            <div className="appointment-doctor-info">
                              <p className="doctor-name">{doctor?.name || `Dr. ${appointment.doctorId}`}</p>
                              <p className="doctor-specialty">{doctor?.specialty || 'General Practice'}</p>
                            </div>
                            <div className="appointment-datetime">
                              <p className="appointment-date">{date}</p>
                              <p className="appointment-time">{time}</p>
                            </div>
                            <div className="appointment-actions">
                              <button 
                                className="btn-cancel-appointment"
                                onClick={() => handleAppointmentCancel(appointment.id)}
                                disabled={cancelLoading}
                              >
                                {cancelLoading ? 'Cancelling...' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Appointments - Collapsible */}
            {appointments.filter(apt => apt.status === 'cancelled').length > 0 && (
              <div className="appointments-section cancelled-appointments-section">
                <button 
                  className="section-toggle"
                  onClick={() => setShowCancelled(!showCancelled)}
                >
                  <h2 className="section-title">Cancelled ({appointments.filter(apt => apt.status === 'cancelled').length})</h2>
                  <span className={`toggle-icon ${showCancelled ? 'expanded' : ''}`}>
                    <span className="material-symbols-outlined">expand_more</span>
                  </span>
                </button>
                {showCancelled && (
                  <div className="appointments-container">
                    <div className="appointments-list">
                      {appointments
                        .filter(appointment => appointment.status === 'cancelled')
                        .map((appointment) => {
                          const { date, time } = formatDateTime(appointment.startTime)
                          const doctor = doctorMap.get(appointment.doctorId)
                          
                          return (
                            <div key={appointment.id} className="appointment-row cancelled">
                              <div className="appointment-doctor-info">
                                <p className="doctor-name">{doctor?.name || `Dr. ${appointment.doctorId}`}</p>
                                <p className="doctor-specialty">{doctor?.specialty || 'General Practice'}</p>
                              </div>
                              <div className="appointment-datetime">
                                <p className="appointment-date">{date}</p>
                                <p className="appointment-time">{time}</p>
                              </div>
                              <div className="appointment-actions">
                                {/* No action button for cancelled appointments */}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </PageContainer>

      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDoctorSelect={handleDoctorSelect}
      />
    </PageLayout>
  )
}


