// utils/findAvailableDoctor.ts

import type { Doctor, Appointment } from '../types/index.types'
import { calculateTimeSlotAvailability } from './timeSlotUtils'
import Constants from '../constants'

const { 
  STATUS_APPOINTMENT: { SCHEDULED },
  NUMBERS: { ZERO },
} = Constants

export function findAvailableDoctorsForChange(
  doctors: Doctor[],
  appointments: Appointment[],
  doctorAvailabilities: Record<string, string[]>,
  appointmentToChange: Appointment
): Doctor[] {
  const {
    id: appointmentId,
    doctorId: currentDoctorId,
    startTime,
    durationMinutes,
  } = appointmentToChange

  const currentDoctor = doctors.find(doctor => doctor.id === currentDoctorId)

  return doctors.filter((doctor) => {
    if (doctor.id === currentDoctorId) return false
    if (doctor.specialty !== currentDoctor?.specialty) return false

    const availableSlots = doctorAvailabilities[doctor.id]
    if (!availableSlots) return false

    if (!availableSlots.includes(startTime)) return false

    const doctorAppointments = appointments.filter(
      (apt) =>
        apt.doctorId === doctor.id &&
        apt.id !== appointmentId &&
        apt.status !== SCHEDULED
    )

    const slotResult = calculateTimeSlotAvailability(
      doctorAppointments,
      [startTime],
      new Date(startTime),
      durationMinutes
    )[ZERO]

    return slotResult?.available === true
  })
}