import { useState } from 'react'
import { graphql } from '../lib/api'
import { useAuth } from '../auth/useAuth'

type Doctor = {
  id: string
  name: string
  specialty: string
  avatarUrl?: string | null
}

type BookAppointmentParams = {
  doctor: Doctor
  date: Date
  time: string
}

type BookAppointmentResult = {
  success: boolean
  appointmentId?: string
  error?: string
}

const CREATE_APPOINTMENT_MUTATION = `
  mutation CreateAppointment($doctorId: String!, $startTime: DateTime!, $durationMinutes: Int, $notes: String) {
    createAppointment(
      doctorId: $doctorId
      startTime: $startTime
      durationMinutes: $durationMinutes
      notes: $notes
    ) {
      ok
      error
      appointment {
        id
        patientId
        doctorId
        startTime
        durationMinutes
        status
        notes
        createdAt
        updatedAt
      }
    }
  }
`

export function useBookAppointment() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const bookAppointment = async ({
    doctor,
    date,
    time
  }: BookAppointmentParams): Promise<BookAppointmentResult> => {
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    setLoading(true)
    setError('')

    try {
      // Parse the time string and create a proper datetime
      const [timeStr, period] = time.split(' ')
      const [hours, minutes] = timeStr.split(':').map(Number)
      
      let hour24 = hours
      if (period === 'PM' && hours !== 12) {
        hour24 += 12
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0
      }

      const appointmentDateTime = new Date(date)
      appointmentDateTime.setHours(hour24, minutes, 0, 0)

      const variables = {
        doctorId: doctor.id,
        startTime: appointmentDateTime.toISOString(),
        durationMinutes: 60, // Default 1 hour appointment
        notes: `Appointment with ${doctor.name} (${doctor.specialty})`
      }

      const data = await graphql<{
        createAppointment: {
          ok: boolean
          error?: string
          appointment?: {
            id: string
            patientId: string
            doctorId: string
            startTime: string
            durationMinutes: number
            status: string
            notes?: string
            createdAt: string
            updatedAt: string
          }
        }
      }>(CREATE_APPOINTMENT_MUTATION, variables, token)

      if (data.createAppointment.ok && data.createAppointment.appointment) {
        return {
          success: true,
          appointmentId: data.createAppointment.appointment.id
        }
      } else {
        return {
          success: false,
          error: data.createAppointment.error || 'Failed to book appointment'
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book appointment'
      // setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    bookAppointment,
    loading,
    error
  }
}
