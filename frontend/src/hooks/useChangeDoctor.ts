import { useState } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'

const CHANGE_APPOINTMENT_MUTATION = `
mutation($id: String!, $newDoc: String!) {
  changeDoctor(id: $id, newDoctorId: $newDoc) {
    ok
    error
    appointment {
      id
      doctorId
    }
  }
}
`

type ChangeDoctorResult = {
  success: boolean
  error?: string
}

const useChangeDoctor = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const changeDoctor = async (appointmentId: string, newDoc: string): Promise<ChangeDoctorResult> => {
    if (!token) {
      setError('Not authenticated')
      return { success: false, error: 'Not authenticated' }
    }

    setLoading(true)
    setError('')

    try {
      const variables = {
        id: appointmentId,
        newDoc
      }

      const data = await graphql<{ rescheduleAppointment: { ok: boolean, error?: string } }>(CHANGE_APPOINTMENT_MUTATION, variables, token)

      if (data.rescheduleAppointment.ok) {
        return { success: true }
      } else {
        const errorMessage = data.rescheduleAppointment.error || 'Failed to change doctor'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change doctor'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return { changeDoctor, loading, error }
}

export default useChangeDoctor
