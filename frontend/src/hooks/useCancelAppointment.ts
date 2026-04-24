import { useState } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'
import { Mutation } from '../graphql'

type CancelAppointmentResult = {
  success: boolean
  error?: string
}

export function useCancelAppointment() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const cancelAppointment = async (appointmentId: string): Promise<CancelAppointmentResult> => {
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    setLoading(true)
    setError('')

    try {
      const variables = {
        id: appointmentId
      }

      const data = await graphql<{
        cancelAppointment: {
          ok: boolean
          error?: string
        }
      }>(Mutation.CANCEL_APPOINTMENT_MUTATION, variables, token)

      if (data.cancelAppointment.ok) {
        return { success: true }
      } else {
        return {
          success: false,
          error: data.cancelAppointment.error || 'Failed to cancel appointment'
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel appointment'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    cancelAppointment,
    loading,
    error
  }
}
