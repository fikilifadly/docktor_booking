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

const CANCEL_APPOINTMENT_MUTATION = `
  mutation CancelAppointment($id: String!) {
    cancelAppointment(id: $id) {
      ok
      error
    }
  }
`

const RESCHEDULE_APPOINTMENT_MUTATION = `
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

export default { 
  CREATE_APPOINTMENT_MUTATION,
  CANCEL_APPOINTMENT_MUTATION, 
  RESCHEDULE_APPOINTMENT_MUTATION,
  CHANGE_DOCTOR_MUTATION,
}
