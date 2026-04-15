export type Appointment = {
  id: string
  startTime: string
  durationMinutes: number
  status: string
}

// Default time slots: 11 AM to 4 PM
export const DEFAULT_TIME_SLOTS = [
  '11:00 AM',
  '12:00 PM', 
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM'
]

export type TimeSlot = {
  time: string
  available: boolean
  booked?: boolean
  reason?: string
}

// Helper function to parse time string (e.g., "11:00 AM" -> {hours: 11, minutes: 0})
function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [time, period] = timeString.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  
  if (period === 'PM' && hours !== 12) {
    return { hours: hours + 12, minutes }
  } else if (period === 'AM' && hours === 12) {
    return { hours: 0, minutes }
  }
  
  return { hours, minutes }
}

// Helper function to check if a time slot conflicts with an appointment
function isTimeSlotBooked(
  timeString: string, 
  appointment: Appointment, 
  appointmentDurationMinutes: number = 60
): boolean {
  const timeSlot = parseTimeString(timeString)
  const appointmentStart = new Date(appointment.startTime)
  const appointmentEnd = new Date(appointmentStart.getTime() + appointment.durationMinutes * 60000)
  
  const slotStart = new Date(appointmentStart)
  slotStart.setHours(timeSlot.hours, timeSlot.minutes, 0, 0)
  const slotEnd = new Date(slotStart.getTime() + appointmentDurationMinutes * 60000)
  
  // Check if time slots overlap
  return slotStart < appointmentEnd && slotEnd > appointmentStart
}

// Helper function to check if a time slot is in the past
function isTimeSlotInPast(timeString: string, selectedDate: Date): boolean {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
  
  // If selected date is in the past, all slots are unavailable
  if (selectedDay < today) return true
  
  // If selected date is today, check if the time slot is in the past
  if (selectedDay.getTime() === today.getTime()) {
    const timeSlot = parseTimeString(timeString)
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const slotTime = timeSlot.hours * 60 + timeSlot.minutes
    
    // If the time slot is in the past (with 30-minute buffer), it's unavailable
    return slotTime <= currentTime + 30
  }
  
  return false
}

export function calculateTimeSlotAvailability(
  appointments: Appointment[],
  selectedDate: Date | null,
  appointmentDurationMinutes: number = 60
): TimeSlot[] {
  console.log('Calculating time slot availability:', { appointments, selectedDate, appointmentDurationMinutes })
  
  if (!selectedDate) {
    return DEFAULT_TIME_SLOTS.map(time => ({ time, available: true }))
  }

  return DEFAULT_TIME_SLOTS.map(time => {
    // Check if slot is in the past
    if (isTimeSlotInPast(time, selectedDate)) {
      return {
        time,
        available: false,
        reason: 'Time has passed'
      }
    }

    // Check if slot conflicts with existing appointments
    const isBooked = appointments.some(appointment => 
      isTimeSlotBooked(time, appointment, appointmentDurationMinutes)
    )

    if (isBooked) {
      return {
        time,
        available: false,
        booked: true,
        reason: 'Already booked'
      }
    }

    return {
      time,
      available: true
    }
  })
}
