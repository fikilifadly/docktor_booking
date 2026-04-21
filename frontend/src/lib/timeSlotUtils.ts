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
  const bufferTime = new Date(now.getTime() + 30 * 60000)

  return slotStart <= bufferTime
}

/**
 * Main calculator
 */
export function calculateTimeSlotAvailability(
  appointments: Appointment[],
  availableSlots: string[], // ISO from backend
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

    // 1️⃣ Past check
    if (isTimeSlotInPast(slotStart)) {
      return {
        time: displayTime,
        available: false,
        reason: 'Time has passed',
      }
    }

    // 2️⃣ Conflict check (only needed if backend does NOT exclude booked)
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