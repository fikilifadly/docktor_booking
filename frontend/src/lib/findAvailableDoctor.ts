import type { Doctor, Appointment } from '../types/index.types'
import { calculateTimeSlotAvailability } from './timeSlotUtils'
import Constants from '../constants'

const {
  STATUS_APPOINTMENT: { SCHEDULED },
} = Constants

export function findAvailableDoctorsForChange(
  targetAppointment: Appointment,
  doctors: Doctor[],
  appointments: Appointment[],
  doctorAvailabilities: Record<string, string[]>
): Doctor[] {
  const appointmentDate = new Date(targetAppointment.startTime)

  const targetDoctor = doctors.find(
    (d) => d.id === targetAppointment.doctorId
  )

  if (!targetDoctor) return []

  const scheduledByDoctor = new Map<string, Appointment[]>()

  for (const apt of appointments) {
    if (apt.status !== SCHEDULED) continue

    if (!scheduledByDoctor.has(apt.doctorId)) {
      scheduledByDoctor.set(apt.doctorId, [])
    }

    scheduledByDoctor.get(apt.doctorId)!.push(apt)
  }

  return doctors.filter((doctor) => {
    if (doctor.specialty !== targetDoctor.specialty) return false

    if (doctor.id === targetDoctor.id) return false

    const availableSlots = doctorAvailabilities[doctor.id]
    if (!availableSlots?.length) return false

    const hasExactSlot = availableSlots.some(
      (slot) => new Date(slot).getTime() === appointmentDate.getTime()
    )

    if (!hasExactSlot) return false

    const doctorScheduledAppointments =
      scheduledByDoctor.get(doctor.id) || []

    const slotCheck = calculateTimeSlotAvailability(
      doctorScheduledAppointments,
      [appointmentDate.toISOString()],
      appointmentDate,
      targetAppointment.durationMinutes
    )

    return slotCheck[0]?.available === true
  })
}