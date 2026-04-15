import { useState, useEffect } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'
import type { Appointment } from '../lib/timeSlotUtils'

const APPOINTMENTS_BY_DOCTOR_QUERY = `
  query AppointmentsByDoctor($doctorId: String!, $date: DateTime!) {
    appointmentsByDoctor(doctorId: $doctorId, date: $date) {
      id
      startTime
      durationMinutes
      status
    }
  }
`

type UseAppointmentsByDoctorResult = {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAppointmentsByDoctor(
  doctorId: string | null,
  date: Date | null
): UseAppointmentsByDoctorResult {
  const { token } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = async () => {
    if (!doctorId || !token) {
      setAppointments([])
      return
    }
    
    if (!date) {
      setAppointments([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert local date to UTC date for the same calendar day
      // This ensures that when user selects Sept 27th, we query for Sept 27th UTC
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
      
      const data = await graphql<{ appointmentsByDoctor: Appointment[] }>(
        APPOINTMENTS_BY_DOCTOR_QUERY,
        {
          doctorId,
          date: utcDate.toISOString()
        },
        token
      )
      setAppointments(data.appointmentsByDoctor || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch appointments when doctorId or date changes
  useEffect(() => {
    fetchAppointments()
  }, [doctorId, date])

  // Reset error when doctorId or date changes
  useEffect(() => {
    setError(null)
  }, [doctorId, date])

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments
  }
}
