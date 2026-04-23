import { useState } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'

const RESCHEDULE_APPOINTMENT_MUTATION = `
mutation($id: String!, $newStart: DateTime!, $newDur: Int) {
  rescheduleAppointment(id: $id, newStartTime: $newStart, newDurationMinutes: $newDur) {
    ok
    error
    appointment {
      id
      startTime
      durationMinutes
    }
  }
}
`

type RescheduleAppointmentResult = {
  success: boolean
  error?: string
}

export const useRescheduleAppointment = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const rescheduleAppointment = async (appointmentId: string, newStart: Date): Promise<RescheduleAppointmentResult> => {
    if (!token) {
      setError('Not authenticated')
      return { success: false, error: 'Not authenticated' }
    }

    setLoading(true)
    setError('')

    try {
      const variables = {
        id: appointmentId,
        newStart: newStart.toISOString(),
        newDur: 60
      }

      const data = await graphql<{ rescheduleAppointment: { ok: boolean, error?: string } }>(RESCHEDULE_APPOINTMENT_MUTATION, variables, token)

      if (data.rescheduleAppointment.ok) {
        return { success: true }
      } else {
        const errorMessage = data.rescheduleAppointment.error || 'Failed to reschedule appointment'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return { rescheduleAppointment, loading, error }
}

export default useRescheduleAppointment