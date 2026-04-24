import { useState } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'
import { Mutation } from '../graphql'

import type { MutationResult } from '../types/index.types'


const useChangeDoctor = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const changeDoctor = async (appointmentId: string, newDoc: string): Promise<MutationResult> => {
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
      }>(Mutation.CHANGE_DOCTOR_MUTATION, variables, token)

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
