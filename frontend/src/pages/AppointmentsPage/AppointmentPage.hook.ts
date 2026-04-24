import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { useAppointments } from "../../features/appointments/hooks/useAppointments"
import { useDoctors } from "../../features/appointments/hooks/useDoctors"
import { useCancelAppointment } from "../../hooks/useCancelAppointment"
import useChangeDoctor from "../../hooks/useChangeDoctor"
import useRescheduleAppointment from "../../hooks/useRescheduleAppointment"
import Constants from "../../constants"
import { CONFIRMATION_TYPE } from "./AppointmentsPage.config"
import { toast } from "react-toastify"

import type {
  ConfirmationStateModal,
  UseFlaggingStates,
  PendingDoctorChange,
  PendingReschedule,
  SelectedAppointment,
  UseCategoryAppointment,
  UseStates,
  ConfirmationType
} from "./AppointmentPage.types"
import type { Appointment, MutationResult, Doctor } from "../../types/index.types"
import { combineDateAndTime, splitDateUtc } from "../../lib/timeSlotUtils"

const {
  NUMBERS: { ZERO },
  STATUS_APPOINTMENT: { CANCELLED },
} = Constants

/**
 * _handleConfirmReschedule
 * 
 * @param {string} appointmentId 
 * @param {Date} newDate 
 * @param {string} newTime
 * @returns {void}
 * @Private
 */
const _handleConfirmReschedule = (
  { setIsModalRescheduleOpen }: UseFlaggingStates,
  { setPendingReschedule, setConfirmationStateModal, selectedAppointment }: UseStates
) => (appointmentId: string, newDate: Date, newTime: string): void => {
  setPendingReschedule({
    appointmentId,
    newDate,
    newTime,
  })

  setIsModalRescheduleOpen(false)

  setConfirmationStateModal({
    isOpen: true,
    type: CONFIRMATION_TYPE.RESCHEDULE.type,
    appointmentId,
    prevState: `${selectedAppointment?.startDate?.toLocaleDateString()} at ${selectedAppointment?.startTime}`,
    newState: `${newDate.toLocaleDateString()} at ${newTime}`,
  })
}

/**
 * _handleOpenConfirmationModal
 * 
 * @param {ConformationType} type 
 * @param {string} appointmentId 
 * @param {string} prevState 
 * @param {string} newState 
 * @returns {void}
 * @private
 */
const _handleOpenConfirmationModal = ({ setConfirmationStateModal }: UseStates) =>
  (type: ConfirmationType, appointmentId: string, prevState: string = "", newState: string = "") =>
    (): void => {
      setConfirmationStateModal({
        isOpen: true,
        type,
        appointmentId,
        prevState,
        newState,
      })
    }

/**
 * _handleCloseConfirmationModal
 * 
 * @param {UseStates} states 
 * @returns {void}
 * @private
 */
const _handleCloseConfirmationModal = ({ setConfirmationStateModal }: UseStates): VoidFunction => (): void => {
  setConfirmationStateModal(null)
}

/**
 * _handleSelectNewDoctor
 *  
 * @param {UseFlaggingStates} flagging 
 * @param {UseStates} states 
 * @param {Map<string, Doctor>} doctorMap
 * @returns {VoidFunction}
 * @private
 */
const _handleSelectNewDoctor = (
  { setIsChangeDoctorOpen }: UseFlaggingStates,
  { setPendingDoctorChange, setConfirmationStateModal, selectedAppointment }: UseStates,
  doctorMap: Map<string, Doctor>,
) => (doctorId: string): VoidFunction => (): void => {
  if (!selectedAppointment) return

  const newDoctor = doctorMap.get(doctorId)

  setPendingDoctorChange({
    appointmentId: selectedAppointment.id,
    newDoctorId: doctorId,
    prevDoctorName: selectedAppointment?.doctorName || "",
    newDoctorName: newDoctor?.name || doctorId,
  })

  setIsChangeDoctorOpen(false)

  setConfirmationStateModal({
    isOpen: true,
    type: CONFIRMATION_TYPE.CHANGE_DOCTOR.type,
    appointmentId: selectedAppointment.id,
    prevState: selectedAppointment.doctorName,
    newState: newDoctor?.name || doctorId,
  })
}

/**
 * _handleToggleBookAppointmentModal
 * 
 * @param {UseFlaggingStates} flagging
 * @returns {void}
 * @private
 */
const _handleToggleBookAppointmentModal = ({ setisModalAppointmentOpen }: UseFlaggingStates) => (): void => {
  setisModalAppointmentOpen((previsModalAppointmentOpen) => !previsModalAppointmentOpen)
}

const _handleOnChangeDoctorButton = ({ setIsChangeDoctorOpen }: UseFlaggingStates, { setSelectedAppointment }: UseStates) => (appointment: Appointment, doctor?: Doctor): void => {
  setSelectedAppointment({
    id: appointment.id,
    doctorId: appointment.doctorId,
    doctorName: doctor?.name || appointment.doctorId,
    speciality: doctor?.specialty || "General Practice",
    startTime: appointment.startTime,
  })
  setIsChangeDoctorOpen(true)
}

/**
 * _handleOnRescheduleButton
 * 
 * @param {UseFlaggingStates} flagging 
 * @param {UseStates} states
 * @returns {VoidFunction}
 * @private
 */
const _handleOnRescheduleButton = ({ setIsModalRescheduleOpen }: UseFlaggingStates, { setSelectedAppointment }: UseStates) => (appointment: Appointment, doctor: Doctor): void => {
  const { splitDate, splitTime } = splitDateUtc(new Date(appointment.startTime))

  setSelectedAppointment({
    id: appointment.id,
    doctorName: doctor?.name,
    doctorId: appointment.doctorId,
    speciality: doctor?.specialty || "General Practice",
    startTime: splitTime,
    startDate: splitDate,
  })

  setIsModalRescheduleOpen(true)
}

/**
 * _handleToggleDoctorModal
 * 
 * @param {UseFlaggingStates} flagging
 * @returns {void}
 * @private
 */
const _handleToggleDoctorModal = ({ setIsChangeDoctorOpen }: UseFlaggingStates) => (): void => {
  setIsChangeDoctorOpen((prevIsChangeDoctorOpen) => !prevIsChangeDoctorOpen)
}

/**
 * _handleOnCloseRescheduleModal
 * 
 * @param {UseFlaggingStates} flagging
 * @param {UseStates} states
 * @returns {void}
 * @private
 */
const _handleOnCloseRescheduleModal = ({ setIsModalRescheduleOpen }: UseFlaggingStates, { setSelectedAppointment, setPendingReschedule }: UseStates) => (): void => {
  setIsModalRescheduleOpen(false)
  setSelectedAppointment(null)
  setPendingReschedule(null)
}

/**
 * _handler
 * 
 * @param {UseFlaggingStates} flagging 
 * @param {UseStates} states 
 * @returns {Handlers}
 * @private
 */
const _handler = (flagging: UseFlaggingStates, states: UseStates, doctorMap: Map<string, Doctor>) => ({
  handleConfirmReschedule: _handleConfirmReschedule(flagging, states),
  handleOpenConfirmationModal: _handleOpenConfirmationModal(states),
  handleCloseConfirmationModal: _handleCloseConfirmationModal(states),
  handleSelectNewDoctor: _handleSelectNewDoctor(flagging, states, doctorMap),
  handleToggleBookAppointmentModal: _handleToggleBookAppointmentModal(flagging),
  handleOnChangeDoctorButton: _handleOnChangeDoctorButton(flagging, states),
  handleOnRescheduleButton: _handleOnRescheduleButton(flagging, states),
  handleToggleDoctorModal: _handleToggleDoctorModal(flagging),
  handleOnCloseRescheduleModal: _handleOnCloseRescheduleModal(flagging, states),
})

/**
 * _handleOnConfirmActionModal
 * 
 * @param {UseStates} states 
 * @param {() => void} logout 
 * @param {(path: string) => void} navigate 
 * @param {(appointmentId: string, newDoc: string) => Promise<MutationResult>} changeDoctor 
 * @param {(appointmentId: string, newStart: Date) => Promise<MutationResult>} rescheduleAppointment 
 * @param {(appointmentId: string) => Promise<MutationResult>} cancelAppointment 
 * @param {() => void} refetch 
 * @returns {VoidFunction}
 * @private
 */
const _handleOnConfirmActionModal = (
  states: UseStates,
  logout: () => void,
  navigate: (path: string) => void,
  changeDoctor: (appointmentId: string, newDoc: string) => Promise<MutationResult>,
  rescheduleAppointment: (appointmentId: string, newStart: Date) => Promise<MutationResult>,
  cancelAppointment: (appointmentId: string) => Promise<MutationResult>,
  refetch: () => void,
) => async (): Promise<void> => {
  const { confirmationStateModal, pendingDoctorChange, pendingReschedule, setPendingDoctorChange, setPendingReschedule, setConfirmationStateModal } = states

  if (!confirmationStateModal?.type || !confirmationStateModal?.appointmentId) return

  try {
    switch (confirmationStateModal.type) {
      case CONFIRMATION_TYPE.LOGOUT.type: {
        logout()
        navigate("/login")
        break
      }

      case CONFIRMATION_TYPE.CANCEL.type: {
        const result = await cancelAppointment(confirmationStateModal.appointmentId)

        if (result.success) {
          toast.success(CONFIRMATION_TYPE.CANCEL.toastSuccess)
        } else {
          toast.error(CONFIRMATION_TYPE.CANCEL.toastError)
        }

        break
      }

      case CONFIRMATION_TYPE.CHANGE_DOCTOR.type: {
        if (!pendingDoctorChange) return

        const result = await changeDoctor(
          pendingDoctorChange.appointmentId,
          pendingDoctorChange.newDoctorId
        )

        if (result.success) {
          toast.success(CONFIRMATION_TYPE.CHANGE_DOCTOR.toastSuccess)
        } else {
          toast.error(CONFIRMATION_TYPE.CHANGE_DOCTOR.toastError)
        }

        setPendingDoctorChange(null)
        break
      }

      case CONFIRMATION_TYPE.RESCHEDULE.type: {
        if (!pendingReschedule) return

        const dateTime = combineDateAndTime(
          pendingReschedule.newDate,
          pendingReschedule.newTime
        )

        const result = await rescheduleAppointment(
          pendingReschedule.appointmentId,
          dateTime
        )

        if (result.success) {
          toast.success(CONFIRMATION_TYPE.RESCHEDULE.toastSuccess)
        } else {
          toast.error(CONFIRMATION_TYPE.RESCHEDULE.toastError)
        }

        setPendingReschedule(null)
        break
      }
    }
  } catch (err) {
    console.error(err)

    switch (confirmationStateModal?.type) {
      case CONFIRMATION_TYPE.CANCEL.type:
        toast.error(CONFIRMATION_TYPE.CANCEL.toastError)
        break
      case CONFIRMATION_TYPE.CHANGE_DOCTOR.type:
        toast.error(CONFIRMATION_TYPE.CHANGE_DOCTOR.toastError)
        break
      case CONFIRMATION_TYPE.RESCHEDULE.type:
        toast.error(CONFIRMATION_TYPE.RESCHEDULE.toastError)
        break
    }
  } finally {
    setConfirmationStateModal(null)
    refetch()
  }
}

/**
 * useFlaggingStates
 * 
 * @returns {UseFlaggingStates}
 */
const useFlaggingStates = (): UseFlaggingStates => {
  const [isChangeDoctorOpen, setIsChangeDoctorOpen] = useState(false)
  const [isModalRescheduleOpen, setIsModalRescheduleOpen] = useState(false)
  const [isModalAppointmentOpen, setisModalAppointmentOpen] = useState(false)
  const [isShowCancelled, setIsShowCancelled] = useState(false)
  const [isShowPast, setIsShowPast] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  return {
    isChangeDoctorOpen,
    setIsChangeDoctorOpen,
    isModalRescheduleOpen,
    setIsModalRescheduleOpen,
    isModalAppointmentOpen,
    setisModalAppointmentOpen,
    isConfirmationOpen,
    setIsConfirmationOpen,
    isShowCancelled,
    setIsShowCancelled,
    isShowPast,
    setIsShowPast
  }
}

/**
 * _useCategoryAppointment
 * 
 * @param {Appointment[]} appointments - appointments
 * @returns {UseCategoryAppointment}
 */
const useCategoryAppointment = (appointments: Appointment[]): UseCategoryAppointment =>
  useMemo(() => {
    const now = Date.now()

    const upcomingAppointments: Appointment[] = []
    const pastAppointments: Appointment[] = []
    const cancelledAppointments: Appointment[] = []

    for (const apt of appointments) {
      if (apt.status === CANCELLED) {
        cancelledAppointments.push(apt)
        continue
      }

      const startTime = new Date(apt.startTime).getTime()

      if (startTime < now) {
        pastAppointments.push(apt)
      } else {
        upcomingAppointments.push(apt)
      }
    }

    return {
      upcomingAppointments,
      pastAppointments,
      cancelledAppointments,
      hasUpcomingAppointments: upcomingAppointments.length > 0,
      hasPastAppointments: pastAppointments.length > 0,
      hasCancelledAppointments: cancelledAppointments.length > 0,
    }
  }, [appointments])

/**
 * _states
 * 
 * @returns {UseStates}
 */
const Usestates = (): UseStates => {
  const [pendingDoctorChange, setPendingDoctorChange] = useState<PendingDoctorChange | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null)
  const [pendingReschedule, setPendingReschedule] = useState<PendingReschedule | null>(null)
  const [confirmationStateModal, setConfirmationStateModal] = useState<ConfirmationStateModal | null>(null)

  return {
    pendingDoctorChange,
    setPendingDoctorChange,
    selectedAppointment,
    setSelectedAppointment,
    pendingReschedule,
    setPendingReschedule,
    confirmationStateModal,
    setConfirmationStateModal
  }
}

const useAppointmentPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const { doctors } = useDoctors()
  const getAppointments = useAppointments()
  const getCancelAppointment = useCancelAppointment()
  const { changeDoctor, loading: changeLoading } = useChangeDoctor()
  const { rescheduleAppointment } = useRescheduleAppointment()

  const flaggingStates = useFlaggingStates()
  const categoryAppointments = useCategoryAppointment(getAppointments.appointments)
  const states = Usestates()

  const doctorMap = useMemo(() => {
    const map = new Map()
    doctors.forEach((doctor) => {
      map.set(doctor.id, doctor)
    })
    return map
  }, [doctors])

  const handler = _handler(flaggingStates, states, doctorMap)
  const handleOnConfirmActionModal = _handleOnConfirmActionModal(
    states,
    logout,
    navigate,
    changeDoctor,
    rescheduleAppointment,
    getCancelAppointment.cancelAppointment,
    getAppointments.refetch,
  )

  return {
    ...flaggingStates,
    ...categoryAppointments,
    ...states,
    ...getAppointments,
    ...getCancelAppointment,
    ...handler,
    handleOnConfirmActionModal,
    doctorMap,
    doctors,
    logout,
    changeDoctor,
    changeLoading,
    rescheduleAppointment,
    navigate,
  }
}

export default useAppointmentPage