export type Appointment = {
  id: string
  startTime: string
  durationMinutes: number
  status: string
}

export type TimeSlot = {
  time: string
  available: boolean
  booked?: boolean
  reason?: string
}

export const splitDateUtc = (date: Date): { splitDate: Date; splitTime: string } => {
  const splitDate = new Date(date.toISOString().split('T')[0])
  const splitTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  return { splitDate, splitTime }
}

/**
 * Check if slot overlaps with an appointment
 */
function isTimeSlotBooked(
  slotStart: Date,
  appointment: Appointment,
  appointmentDurationMinutes: number = 60
): boolean {
  const appointmentStart = new Date(appointment.startTime)
  const appointmentEnd = new Date(
    appointmentStart.getTime() + appointment.durationMinutes * 60000
  )

  const slotEnd = new Date(
    slotStart.getTime() + appointmentDurationMinutes * 60000
  )

  return slotStart < appointmentEnd && slotEnd > appointmentStart
}

/**
 * Check if slot is in the past (30 min buffer)
 */
function isTimeSlotInPast(slotStart: Date): boolean {
  const now = new Date()
  const bufferTime = now.getTime() + 30 * 60000
  
  return slotStart.getTime() <= bufferTime
}
/**
 * Main calculator
 */
export function calculateTimeSlotAvailability(
  appointments: Appointment[],
  availableSlots: string[],
  selectedDate: Date | null,
  appointmentDurationMinutes: number = 60
): TimeSlot[] {
  if (!selectedDate) return []

  return availableSlots.map((slotISO) => {
    const slotStart = new Date(slotISO)

    const displayTime = slotStart.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    if (isTimeSlotInPast(slotStart)) {
      return {
        time: displayTime,
        available: false,
        reason: 'Time has passed',
      }
    }

    const isBooked = appointments.some((appointment) =>
      isTimeSlotBooked(slotStart, appointment, appointmentDurationMinutes)
    )

    if (isBooked) {
      return {
        time: displayTime,
        available: false,
        booked: true,
        reason: 'Already booked',
      }
    }

    return {
      time: displayTime,
      available: true,
    }
  })
}