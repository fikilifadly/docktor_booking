import { CONFIRMATION_TYPE } from "./AppointmentsPage.config"
import type { BooleanVoidFunc, Appointment } from "../../types/index.types"

export type SelectedAppointment = {
  id: string
  doctorId?: string
  doctorName?: string
  speciality?: string
  startTime: string
  startDate?: Date
}

export type PendingDoctorChange = {
  appointmentId: string
  newDoctorId: string
}

export type PendingReschedule = {
  appointmentId: string
  newDate: Date
  newTime: string
}

export type ConfirmationType = typeof CONFIRMATION_TYPE[keyof typeof CONFIRMATION_TYPE]['type']
export type ConfirmationTitleMessage = {
  title: string
  message: string
}

export type ConfirmationStateModal = {
  isOpen: boolean
  type: string
  appointmentId: string
  prevState: string
  newState: string
}

export type UseFlaggingStates = {
  isChangeDoctorOpen: boolean
  setIsChangeDoctorOpen: BooleanVoidFunc
  isModalRescheduleOpen: boolean
  setIsModalRescheduleOpen: BooleanVoidFunc
  isModalAppointmentOpen: boolean
  setisModalAppointmentOpen: BooleanVoidFunc
  isConfirmationOpen: boolean
  setIsConfirmationOpen: BooleanVoidFunc
  isShowCancelled: boolean
  setIsShowCancelled: BooleanVoidFunc
  isShowPast: boolean
  setIsShowPast: BooleanVoidFunc
}

export type UseCategoryAppointment = {
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  hasUpcomingAppointments: boolean
  hasPastAppointments: boolean
  hasCancelledAppointments: boolean
}

export type UseAppointmentPage = {
  ...UseFlaggingStates,
  ...UseCategoryAppointment
}