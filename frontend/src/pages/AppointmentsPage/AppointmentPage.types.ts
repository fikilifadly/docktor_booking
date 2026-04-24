import { CONFIRMATION_TYPE } from "./AppointmentsPage.config"
import type { BooleanSetter, Appointment } from "../../types/index.types"

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
  prevDoctorName: string
  newDoctorName: string
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
  prevState?: string
  newState: string
}

export type UseFlaggingStates = {
  isChangeDoctorOpen: boolean
  setIsChangeDoctorOpen: BooleanSetter
  isModalRescheduleOpen: boolean
  setIsModalRescheduleOpen: BooleanSetter
  isModalAppointmentOpen: boolean
  setisModalAppointmentOpen: BooleanSetter
  isConfirmationOpen: boolean
  setIsConfirmationOpen: BooleanSetter
  isShowCancelled: boolean
  setIsShowCancelled: BooleanSetter
  isShowPast: boolean
  setIsShowPast: BooleanSetter
}

export type UseCategoryAppointment = {
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  hasUpcomingAppointments: boolean
  hasPastAppointments: boolean
  hasCancelledAppointments: boolean
}

export type UseStates = {
  pendingDoctorChange: PendingDoctorChange | null
  setPendingDoctorChange: (value: PendingDoctorChange | null) => void
  selectedAppointment: SelectedAppointment | null
  setSelectedAppointment: (value: SelectedAppointment | null) => void
  pendingReschedule: PendingReschedule | null
  setPendingReschedule: (value: PendingReschedule | null) => void
  confirmationStateModal: ConfirmationStateModal | null
  setConfirmationStateModal: (value: ConfirmationStateModal | null) => void
}

// export type Handlers = {

// }

// export type UseAppointmentPage = {
//   ...UseFlaggingStates,
//   ...UseCategoryAppointment
// }