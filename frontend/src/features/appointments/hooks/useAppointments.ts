import { useEffect, useState } from 'react'
import { graphql } from '../../../lib/api'
import { useAuth } from '../../../auth/useAuth'

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

const QUERY = `query { appointmentsByPatient { id doctorId startTime durationMinutes status notes createdAt updatedAt } }`

export function useAppointments() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [appointments, setAppointments] = useState<Appointment[]>([])

  async function fetchAppointments() {
    setLoading(true)
    setError('')
    try {
      const data = await graphql<{ appointmentsByPatient: Appointment[] }>(QUERY, undefined, token || undefined)
      setAppointments(data.appointmentsByPatient || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load appointments'
      // If token is invalid, redirect to login
      if (message.includes('Invalid token') || message.includes('Unauthorized')) {
        window.location.href = '/login'
        return
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchAppointments()
  }, [token])

  return { loading, error, appointments, refetch: fetchAppointments }
}


