import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { useAppointments } from "../../features/appointments/hooks/useAppointments"
import { useDoctors } from "../../features/appointments/hooks/useDoctors"
import { useCancelAppointment } from "../../hooks/useCancelAppointment"
import useChangeDoctor from "../../hooks/useChangeDoctor"
import useRescheduleAppointment from "../../hooks/useRescheduleAppointment"
import Constants from "../../constants"

import type { 
  ConfirmationStateModal,
  UseFlaggingStates,
  PendingDoctorChange,
  PendingReschedule,
  SelectedAppointment,
  UseCategoryAppointment
} from "./AppointmentPage.types"
import type { Appointment } from "../../types/index.types"

const {
  NUMBERS: { ZERO },
  STATUS_APPOINTMENT: { CANCELLED },
} = Constants;

const _useFlaggingStates = (): UseFlaggingStates => {
  const [isChangeDoctorOpen, setIsChangeDoctorOpen] = useState(false);
  const [isModalRescheduleOpen, setIsModalRescheduleOpen] = useState(false);
  const [isModalAppointmentOpen, setisModalAppointmentOpen] = useState(false);
  const [isShowCancelled, setIsShowCancelled] = useState(false);
  const [isShowPast, setIsShowPast] = useState(false);

  return {
    isChangeDoctorOpen,
    setIsChangeDoctorOpen,
    isModalRescheduleOpen,
    setIsModalRescheduleOpen,
    isModalAppointmentOpen,
    setisModalAppointmentOpen,
    isShowCancelled,
    setIsShowCancelled,
    isShowPast,
    setIsShowPast
  }
}

const _useCategoryAppointment = (appointments: Appointment[]): UseCategoryAppointment => {
   const {
    upcomingAppointments,
    pastAppointments,
    cancelledAppointments,
    hasUpcomingAppointments,
    hasPastAppointments,
    hasCancelledAppointments,
  } = useMemo(() => {
    const now = Date.now();

    const upcomingAppointments: Appointment[] = [];
    const pastAppointments: Appointment[] = [];
    const cancelledAppointments: Appointment[] = [];

    for (const apt of appointments) {
      if (apt.status === CANCELLED) {
        cancelledAppointments.push(apt);
        continue;
      }

      new Date(apt.startTime).getTime() < now
        ? pastAppointments.push(apt)
        : upcomingAppointments.push(apt);
    }

    return {
      upcomingAppointments,
      pastAppointments,
      cancelledAppointments,
      hasUpcomingAppointments: upcomingAppointments.length > ZERO,
      hasPastAppointments: pastAppointments.length > ZERO,
      hasCancelledAppointments: cancelledAppointments.length > ZERO,
    };
  }, [appointments]);

  return {
    upcomingAppointments,
    pastAppointments,
    cancelledAppointments,
    hasUpcomingAppointments,
    hasPastAppointments,
    hasCancelledAppointments,
  }
}

const _states = () => {}

const useAppointmentPage = (): => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const { loading, error, appointments, refetch } = useAppointments()
  const { doctors } = useDoctors()
  const { cancelAppointment, loading: cancelLoading } = useCancelAppointment()
  const { changeDoctor, loading: changeLoading } = useChangeDoctor()
  const { rescheduleAppointment } = useRescheduleAppointment()

  const [pendingDoctorChange, setPendingDoctorChange] = useState<PendingDoctorChange | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null)
  const [pendingReschedule, setPendingReschedule] = useState<PendingReschedule | null>(null)
  const [confirmationStateModal, setConfirmationStateModal] = useState<ConfirmationStateModal | null>(null);

  const [confirmationType, setConfirmationType] = useState<string | null>(null);
  const [confirmationAppointmentId, setConfirmationAppointmentId] = useState<string | undefined>();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const {
    upcoming,
    past,
    cancelled,
    hasUpcoming,
    hasPast,
    hasCancelled,
  } = useMemo(() => {
    const now = Date.now();

    const upcoming: typeof appointments = [];
    const past: typeof appointments = [];
    const cancelled: typeof appointments = [];

    for (const apt of appointments) {
      if (apt.status === CANCELLED) {
        cancelled.push(apt);
        continue;
      }

      new Date(apt.startTime).getTime() < now
        ? past.push(apt)
        : upcoming.push(apt);
    }

    return {
      upcoming,
      past,
      cancelled,
      hasUpcoming: upcoming.length > ZERO,
      hasPast: past.length > ZERO,
      hasCancelled: cancelled.length > ZERO,
    };
  }, [appointments]);
} 