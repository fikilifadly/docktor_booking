import type { Dispatch, SetStateAction } from "react";

export type BooleanSetter = Dispatch<SetStateAction<boolean>>;

export type Doctor = {
  id: string
  name: string
  specialty: string
  avatarUrl?: string | null
}

export type MutationResult = {
  success: boolean
  error?: string
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