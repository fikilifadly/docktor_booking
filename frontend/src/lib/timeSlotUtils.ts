import Constants from "../constants"

const { 
  NUMBERS: { ZERO, ONE},
  STATUS_APPOINTMENT: { SCHEDULED },
} = Constants

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
  const splitDate = new Date(date.toISOString().split('T')[ZERO])
  const splitTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  return { splitDate, splitTime }
}

export const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);

  return {
    date: date.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

export function combineDateAndTime(
  date: Date,
  timeString: string
): Date {
  const [time, modifier] = timeString.split(" ");

  let hours: number;
  const minutes: number = Number(time.split(":")[ONE]);

  hours = Number(time.split(":")[0]);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);

  return combined;
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

  return (slotStart < appointmentEnd && slotEnd > appointmentStart) && appointment.status === SCHEDULED 
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