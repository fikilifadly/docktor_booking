export const CONFIRMATION_TYPE = {
  LOGOUT: {
    type: 'LOGOUT',
    title: 'Logout',
  },
  CANCEL: {
    type: 'CANCEL',
    title: 'Cancel Appointment',
    toastSuccess: 'Appointment cancelled successfully',
    toastError: 'Failed to cancel appointment. Please try again.',
  },
  CHANGE_DOCTOR: {
    type: 'CHANGE_DOCTOR',
    title: 'Change Appointment',
    toastSuccess: 'Doctor changed successfully',
    toastError: 'Failed to change doctor. Please try again.',
  },
  RESCHEDULE: {
    type: 'RESCHEDULE',
    title: 'Reschedule Appointment',
    toastSuccess: 'Appointment rescheduled successfully',
    toastError: 'Failed to reschedule appointment. Please try again.',
  }
}