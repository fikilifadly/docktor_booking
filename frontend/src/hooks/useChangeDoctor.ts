import { useState } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'
import type { ChangeDoctorResult } from '../types/index.types'

const CHANGE_DOCTOR_MUTATION = `
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

      const data = await graphql<{
        changeDoctor: {
          ok: boolean
          error?: string
          appointment?: {
            id: string
            doctorId: string
          }
        }
      }>(CHANGE_DOCTOR_MUTATION, variables, token)

      if (data.changeDoctor.ok) {
        return { success: true }
      } else {
        const errorMessage = data.changeDoctor.error || 'Failed to change doctor'
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
