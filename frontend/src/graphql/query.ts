const APPOINTMENTS_BY_PATIENT_QUERY = `
  query { 
    appointmentsByPatient {
      id
      doctorId
      startTime
      durationMinutes
      status
      notes
      createdAt
      updatedAt
    }
  }
`

const APPOINTMENTS_BY_DOCTOR_QUERY = `
  query AppointmentsByDoctor($doctorId: String!, $date: DateTime!) {
    appointmentsByDoctor(doctorId: $doctorId, date: $date) {
      id
      startTime
      durationMinutes
      status
    }
  }
`

const DOCTORS_QUERY = `
  query Doctors($q: String, $specialty: String) { 
    doctors(q: $q, specialty: $specialty) { 
      id 
      name 
      specialty 
      avatarUrl 
    } 
  }
`

const DOCTOR_AVAILABILITY_QUERY = `
  query DoctorAvailability($doctorId: String!, $date: Date!) {
    doctorAvailability(doctorId: $doctorId, date: $date) {
      startTime
    } 
  }
`

export default {
  APPOINTMENTS_BY_PATIENT_QUERY,
  APPOINTMENTS_BY_DOCTOR_QUERY,
  DOCTORS_QUERY,
  DOCTOR_AVAILABILITY_QUERY,
}
