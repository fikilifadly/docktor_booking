import { useEffect, useState } from 'react'
import { graphql } from '../../../lib/api'
import { useAuth } from '../../../auth/useAuth'

type Doctor = {
  id: string
  name: string
  specialty: string
  avatarUrl?: string | null
}

const QUERY = `query Doctors($q: String, $specialty: String) { 
  doctors(q: $q, specialty: $specialty) { 
    id 
    name 
    specialty 
    avatarUrl 
  } 
}`

export function useDoctors(q?: string, specialty?: string) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [doctors, setDoctors] = useState<Doctor[]>([])

  async function fetchDoctors() {
    setLoading(true)
    setError('')
    try {
      const data = await graphql<{ doctors: Doctor[] }>(
        QUERY, 
        { q: q || null, specialty: specialty || null }, 
        token || undefined
      )
      setDoctors(data.doctors || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load doctors'
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
    if (token) fetchDoctors()
  }, [token, q, specialty])

  return { loading, error, doctors, refetch: fetchDoctors }
}
