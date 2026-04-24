import { useEffect, useState } from 'react'
import { graphql } from '../../../lib/api'
import { useAuth } from '../../../auth/useAuth'
import { Query} from '../../../graphql'

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

export function useAppointments() {
  const { token } = useAuth()
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [errorAppointments, setErrorAppointments] = useState<string>('')
  const [appointments, setAppointments] = useState<Appointment[]>([])

  async function fetchAppointments() {
    setLoadingAppointments(true)
    setErrorAppointments('')
    try {
      const data = await graphql<{ appointmentsByPatient: Appointment[] }>(Query.APPOINTMENTS_BY_PATIENT_QUERY, undefined, token || undefined)
      setAppointments(data.appointmentsByPatient || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load appointments'
      // If token is invalid, redirect to login
      if (message.includes('Invalid token') || message.includes('Unauthorized')) {
        window.location.href = '/login'
        return
      }
      setErrorAppointments(message)
    } finally {
      setLoadingAppointments(false)
    }
  }

  useEffect(() => {
    if (token) fetchAppointments()
  }, [token])

  return { loadingAppointments, errorAppointments, appointments, refetch: fetchAppointments }
}


