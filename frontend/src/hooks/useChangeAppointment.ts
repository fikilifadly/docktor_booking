import { useState } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'

const CHANGE_APPOINTMENT_MUTATION = `
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

const useChangeAppointment = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const changeAppointment = async (appointmentId: string, newStart: Date, newDur: number) => {
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
        newDur
      }

      const data = await graphql<{ rescheduleAppointment: { ok: boolean, error?: string } }>(CHANGE_APPOINTMENT_MUTATION, variables, token)

      if (data.rescheduleAppointment.ok) {
        return { success: true }
      } else {
        const errorMessage = data.rescheduleAppointment.error || 'Failed to change appointment'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change appointment'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return { changeAppointment, loading, error }
}

export default useChangeAppointment;