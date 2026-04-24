export type BooleanVoidFunc = (value: boolean) => void

export type Doctor = {
  id: string
  name: string
  specialty: string
  avatarUrl?: string | null
}

export type Appointment = {
  id: string
  doctorId: string
  startTime: string
  durationMinutes: number
  status: string
  notes?: string | null
  createdAt: string
  updatedAt: string
}