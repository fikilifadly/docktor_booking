import { useState } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'
import { Mutation } from '../graphql'

import type { MutationResult } from '../types/index.types'

export const useRescheduleAppointment = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const rescheduleAppointment = async (appointmentId: string, newStart: Date): Promise<MutationResult> => {
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

      const data = await graphql<{ rescheduleAppointment: { ok: boolean, error?: string } }>(Mutation.RESCHEDULE_APPOINTMENT_MUTATION, variables, token)

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