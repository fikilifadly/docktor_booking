import { useEffect, useState } from 'react';
import { graphql } from '../lib/api';
import { useAuth } from '../auth/useAuth';

const DOCTOR_AVAILABILITY_QUERY = `
  query DoctorAvailability($doctorId: String!, $date: Date!) {
    doctorAvailability(doctorId: $doctorId, date: $date) {
      startTime
    } 
  }
`;

const useDoctorAvailability = (doctorId: string | null, date: Date | null) => {
  console.log("useDoctorAvailability called with doctorId:", doctorId, "date:", date)
  const { token } = useAuth()
  const [availability, setAvailability] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchAvailability = async () => {
    if (!doctorId) {
      setAvailability([])
      return
    }
    if (!date) {
      setAvailability([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Convert local date to UTC date for the same calendar day
      // This ensures that when user selects Sept 27th, we query for Sept 27th UTC
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
      const data = await graphql<{ doctorAvailability: { startTime: string }[] }>(
        DOCTOR_AVAILABILITY_QUERY,
        {
          doctorId,
          date: utcDate.toISOString().split('T')[0]
        },
        token || undefined
      )
      setAvailability(data.doctorAvailability.map(slot => slot.startTime))
    } catch (err) {
      console.error(err)
      setError('Failed to fetch doctor availability')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [doctorId, date])

  return { availability, loading, error }
}

export default useDoctorAvailability;