import { useState, useMemo } from "react";
import { BookAppointmentModal } from "../../components";
import { PageLayout, PageContainer } from "../../components/layout";
import "./styles.css";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import { CONFIRMATION_TYPE } from "./AppointmentsPage.config";
import { toast } from "react-toastify";
import { getConfirmationTitleMessage } from "./AppointmentPage.utils";
import Constants from "../../constants";
import ChangeDoctorModal from "../../components/modals/ChangeDoctorModal";
import RescheduleAppointmentModal from "../../components/modals/RescheduleAppointmentModal";
import { splitDateUtc, combineDateAndTime } from "../../lib/timeSlotUtils";

const {
  NUMBERS: { ZERO },
  STATUS_APPOINTMENT: { CANCELLED },
} = Constants;

export default function AppointmentsPage() {
  // const { loading, error, appointments, refetch } = useAppointments();
  // const { doctors } = useDoctors();
  // const { cancelAppointment, loading: cancelLoading } = useCancelAppointment();
  // const { logout } = useAuth();
  // const { changeDoctor, loading: changeLoading } = useChangeDoctor();
  // const { rescheduleAppointment } = useRescheduleAppointment();
  // const navigate = useNavigate();

  // const [isChangeDoctorOpen, setIsChangeDoctorOpen] = useState(false);
  // const [isModalRescheduleOpen, setIsModalRescheduleOpen] = useState(false);

  const { upcoming, pasts, cancellations } = useMemo(() => {
    const now = new Date();

    const upcoming: typeof appointments = [];
    const pasts: typeof appointments = [];
    const cancellations: typeof appointments = [];

    appointments.forEach((apt) => {
      if (apt.status === CANCELLED) {
        cancellations.push(apt);
        return;
      }

      const start = new Date(apt.startTime);

      if (start < now) {
        pasts.push(apt);
      } else {
        upcoming.push(apt);
      }
    });

    const hasUpcomingAppointments = upcoming.length > ZERO;
    const hasPastAppointments = pasts.length > ZERO;
    const hasCancelledAppointments = cancellations.length > ZERO;

    return { upcoming, pasts, cancellations, hasUpcomingAppointments, hasPastAppointments, hasCancelledAppointments };
  }, [appointments]);

  // const [selectedAppointment, setSelectedAppointment] = useState<{
  //   id: string;
  //   doctorId?: string;
  //   doctorName?: string;
  //   speciality?: string;
  //   startTime: string;
  //   startDate?: Date;
  // } | null>(null);

  // const [pendingDoctorChange, setPendingDoctorChange] = useState<{
  //   appointmentId: string;
  //   newDoctorId: string;
  //   prevDoctorName: string;
  //   newDoctorName: string;
  // } | null>(null);

  // const [pendingReschedule, setPendingReschedule] = useState<{
  //   appointmentId: string;
  //   newDate: Date;
  //   newTime: string;
  // } | null>(null);

  const handleConfirmReschedule = (appointmentId: string, newDate: Date, newTime: string) => {
    setPendingReschedule({
      appointmentId,
      newDate,
      newTime,
    });

    setIsModalRescheduleOpen(false);

    setConfirmationStateModal({
      isOpen: true,
      type: CONFIRMATION_TYPE.RESCHEDULE.type,
      appointmentId,
      prevState: `${selectedAppointment?.startDate?.toLocaleDateString()} at ${selectedAppointment?.startTime}`,
      newState: `${newDate.toLocaleDateString()} at ${newTime}`,
    });
  };

  // const [confirmationStateModal, setConfirmationStateModal] = useState<{
  //   isOpen: boolean;
  //   type: ConfirmationType | null;
  //   appointmentId?: string;
  //   prevState?: string;
  //   newState?: string;
  // } | null>(null);

  const handleOpenConfirmationModal =
    (type: ConfirmationType, appointmentId: string, prevState: string = "", newState: string = "") =>
    (): void => {
      setConfirmationStateModal({
        isOpen: true,
        type,
        appointmentId,
        prevState,
        newState,
      });
    };

  const handleCloseConfirmationModal = () => {
    setConfirmationStateModal({
      isOpen: false,
      type: null,
    });
  };

  const handleSelectNewDoctor = (doctorId: string) => {
    if (!selectedAppointment) return;

    const newDoctor = doctorMap.get(doctorId);

    setPendingDoctorChange({
      appointmentId: selectedAppointment.id,
      newDoctorId: doctorId,
      prevDoctorName: selectedAppointment?.doctorName || "",
      newDoctorName: newDoctor?.name || doctorId,
    });

    setIsChangeDoctorOpen(false);

    setConfirmationStateModal({
      isOpen: true,
      type: CONFIRMATION_TYPE.CHANGE_DOCTOR.type,
      appointmentId: selectedAppointment.id,
      prevState: selectedAppointment.doctorName,
      newState: newDoctor?.name || doctorId,
    });
  };

  const handleOnConfirmActionModal = async () => {
    if (!confirmationStateModal.type || !confirmationStateModal.appointmentId) return;

    try {
      switch (confirmationStateModal.type) {
        case CONFIRMATION_TYPE.LOGOUT.type: {
          logout();
          navigate("/login");
          break;
        }

        case CONFIRMATION_TYPE.CANCEL.type: {
          const result = await cancelAppointment(confirmationStateModal.appointmentId);

          if (result.success) {
            toast.success(CONFIRMATION_TYPE.CANCEL.toastSuccess);
          } else {
            toast.error(CONFIRMATION_TYPE.CANCEL.toastError);
          }

          break;
        }

        case CONFIRMATION_TYPE.CHANGE_DOCTOR.type: {
          if (!pendingDoctorChange) return;

          const result = await changeDoctor(pendingDoctorChange.appointmentId, pendingDoctorChange.newDoctorId);

          if (result.success) {
            toast.success(CONFIRMATION_TYPE.CHANGE_DOCTOR.toastSuccess);
          } else {
            toast.error(CONFIRMATION_TYPE.CHANGE_DOCTOR.toastError);
          }

          setPendingDoctorChange(null);
          break;
        }

        case CONFIRMATION_TYPE.RESCHEDULE.type: {
          if (!pendingReschedule) return;

          const putDateAndTImeTogether = combineDateAndTime(pendingReschedule.newDate, pendingReschedule.newTime);
          const result = await rescheduleAppointment(pendingReschedule.appointmentId, putDateAndTImeTogether);

          if (result.success) {
            toast.success(CONFIRMATION_TYPE.RESCHEDULE.toastSuccess);
          } else {
            toast.error(CONFIRMATION_TYPE.RESCHEDULE.toastError);
          }

          setPendingReschedule(null);
          break;
        }

        default: {
          break;
        }
      }
    } catch (err) {
      console.error(err);
      switch (confirmationStateModal.type) {
        case CONFIRMATION_TYPE.CANCEL.type:
          toast.error(CONFIRMATION_TYPE.CANCEL.toastError);
          break;
        case CONFIRMATION_TYPE.CHANGE_DOCTOR.type:
          toast.error(CONFIRMATION_TYPE.CHANGE_DOCTOR.toastError);
          break;
        case CONFIRMATION_TYPE.RESCHEDULE.type:
          toast.error(CONFIRMATION_TYPE.RESCHEDULE.toastError);
          break;
        default:
          break;
      }
    } finally {
      handleCloseConfirmationModal();
      refetch();
    }
  };

  const [isModalAppointmentOpen, setisModalAppointmentOpen] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  // Create a mapping from doctorId to doctor information
  const doctorMap = useMemo(() => {
    const map = new Map();
    doctors.forEach((doctor) => {
      map.set(doctor.id, doctor);
    });
    return map;
  }, [doctors]);

  const handleToggleBookAppointmentModal = () => {
    setisModalAppointmentOpen((previsModalAppointmentOpen) => !previsModalAppointmentOpen);
  };

  const formatDateTime = (dateTimeString: string) => {
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

  const headerActions = (
    <button
      className="btn-logout"
      onClick={handleOpenConfirmationModal(CONFIRMATION_TYPE.LOGOUT.type, "")}
    >
      <span className="material-symbols-outlined">logout</span>
      Logout
    </button>
  );

  return (
    <PageLayout
      showHeader
      headerTitle="HealthPlus"
      headerActions={headerActions}
    >
      <PageContainer>
        <div className="appts-header-row">
          <div>
            <h1 className="appts-title">Upcoming Appointments</h1>
            <p className="appts-subtitle">Here are your scheduled appointments.</p>
          </div>
          <div className="appts-actions">
            <button
              className="appts-cta"
              onClick={handleToggleBookAppointmentModal}
            >
              Book an Appointment
            </button>
          </div>
        </div>

        {loading && <div className="loading-message">Loading appointments…</div>}
        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && !hasUpcomingAppointments && (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-state-image">
                <div className="placeholder-image">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
              </div>
              <h3 className="empty-state-title">No upcoming appointments</h3>
              <p className="empty-state-subtitle">You don't have any upcoming appointments. Book one now.</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="appointments-sections">
            {/* Upcoming Appointments */}
            {hasUpcomingAppointments && (
              <div className="appointments-section">
                <h2 className="section-title">Scheduled Appointments</h2>

                <div className="appointments-container">
                  <div className="appointments-list">
                    {upcoming.map((appointment) => {
                      const { date, time } = formatDateTime(appointment.startTime);
                      const doctor = doctorMap.get(appointment.doctorId);

                      const cancelDetail = `Dr. ${doctor?.name || appointment.doctorId} on ${date} at ${time}`;

                      return (
                        <div
                          key={appointment.id}
                          className="appointment-row"
                        >
                          <div className="appointment-doctor-info">
                            <p className="doctor-name">{doctor?.name || `Dr. ${appointment.doctorId}`}</p>
                            <p className="doctor-specialty">{doctor?.specialty || "General Practice"}</p>
                          </div>

                          <div className="appointment-datetime">
                            <p className="appointment-date">{date}</p>
                            <p className="appointment-time">{time}</p>
                          </div>

                          <div className="appointment-actions">
                            <button
                              className="btn-cancel-appointment"
                              onClick={handleOpenConfirmationModal(CONFIRMATION_TYPE.CANCEL.type, appointment.id, cancelDetail)}
                              disabled={cancelLoading}
                            >
                              {cancelLoading ? "Cancelling..." : "Cancel"}
                            </button>

                            <button
                              className="btn-change-appointment"
                              onClick={() => {
                                setSelectedAppointment({
                                  id: appointment.id,
                                  doctorId: appointment.doctorId,
                                  doctorName: doctor?.name || appointment.doctorId,
                                  speciality: doctor?.specialty || "General Practice",
                                  startTime: appointment.startTime,
                                });
                                setIsChangeDoctorOpen(true);
                              }}
                              disabled={cancelLoading}
                            >
                              {changeLoading ? "Changing..." : "Change Doctor"}
                            </button>

                            <button
                              className="btn-reschedule-appointment"
                              onClick={() => {
                                const { splitDate, splitTime } = splitDateUtc(new Date(appointment.startTime));

                                setSelectedAppointment({
                                  id: appointment.id,
                                  doctorName: doctor?.name,
                                  doctorId: appointment.doctorId,
                                  speciality: doctor?.specialty || "General Practice",
                                  startTime: splitTime,
                                  startDate: splitDate,
                                });

                                setIsModalRescheduleOpen(true);
                              }}
                              disabled={cancelLoading}
                            >
                              {cancelLoading ? "Rescheduling..." : "Reschedule"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Appointments - Collapsible */}
            {hasCancelledAppointments && (
              <div className="appointments-section cancelled-appointments-section">
                <button
                  className="section-toggle"
                  onClick={() => setShowCancelled(!showCancelled)}
                >
                  <h2 className="section-title">Cancelled ({appointments.filter((apt) => apt.status === CANCELLED).length})</h2>
                  <span className={`toggle-icon ${showCancelled ? "expanded" : ""}`}>
                    <span className="material-symbols-outlined">expand_more</span>
                  </span>
                </button>
                <div className="appointments-container">
                  <div className="appointments-list">
                    {showCancelled &&
                      cancellations.map((cancelled) => {
                        const { date, time } = formatDateTime(cancelled.startTime);
                        const doctor = doctorMap.get(cancelled.doctorId);

                        return (
                          <div
                            key={cancelled.id}
                            className="appointment-row cancelled"
                          >
                            <div className="appointment-doctor-info">
                              <p className="doctor-name">{doctor?.name || `Dr. ${cancelled.doctorId}`}</p>
                              <p className="doctor-specialty">{doctor?.specialty || "General Practice"}</p>
                            </div>
                            <div className="appointment-datetime">
                              <p className="appointment-date">{date}</p>
                              <p className="appointment-time">{time}</p>
                            </div>
                            <div className="appointment-actions">{/* No action button for cancelled appointments */}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {hasPastAppointments && (
              <div className="appointments-section cancelled-appointments-section">
                <button
                  className="section-toggle"
                  onClick={() => setShowPasts(!showPasts)}
                >
                  <h2 className="section-title">Past Appointments ({appointments.filter((apt) => apt.status === CANCELLED).length})</h2>
                  <span className={`toggle-icon ${showCancelled ? "expanded" : ""}`}>
                    <span className="material-symbols-outlined">expand_more</span>
                  </span>
                </button>
                <div className="appointments-container">
                  <div className="appointments-list">
                    {showPasts &&
                      pasts.map((pasts) => {
                        const { date, time } = formatDateTime(pasts.startTime);
                        const doctor = doctorMap.get(pasts.doctorId);

                        return (
                          <div
                            key={pasts.id}
                            className="appointment-row cancelled"
                          >
                            <div className="appointment-doctor-info">
                              <p className="doctor-name">{doctor?.name || `Dr. ${pasts.doctorId}`}</p>
                              <p className="doctor-specialty">{doctor?.specialty || "General Practice"}</p>
                            </div>
                            <div className="appointment-datetime">
                              <p className="appointment-date">{date}</p>
                              <p className="appointment-time">{time}</p>
                            </div>
                            <div className="appointment-actions">{/* No action button for cancelled appointments */}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </PageContainer>

      <BookAppointmentModal
        isOpen={isModalAppointmentOpen}
        onClose={handleToggleBookAppointmentModal}
        onSuccessBooked={refetch}
        appointments={appointments}
        doctors={doctors}
      />
      <ConfirmationModal
        isOpen={confirmationStateModal.isOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleOnConfirmActionModal}
        {...getConfirmationTitleMessage(confirmationStateModal.type ?? "", confirmationStateModal.prevState, confirmationStateModal.newState)}
      />
      <ChangeDoctorModal
        isOpen={isChangeDoctorOpen}
        onClose={() => setIsChangeDoctorOpen(false)}
        onConfirm={handleSelectNewDoctor}
        availableDoctors={doctors.filter((doctor) => selectedAppointment?.speciality === doctor.specialty)}
        currentDoctorName={selectedAppointment?.doctorName || ""}
      />
      <RescheduleAppointmentModal
        isOpen={isModalRescheduleOpen}
        onClose={() => {
          setIsModalRescheduleOpen(false);
          setSelectedAppointment(null);
          setPendingReschedule(null);
        }}
        appointments={appointments}
        appointmentId={selectedAppointment?.id || ""}
        doctorId={selectedAppointment?.doctorId || ""}
        initialDate={new Date(selectedAppointment?.startDate || "")}
        initialTime={selectedAppointment?.startTime || ""}
        onConfirm={handleConfirmReschedule}
      />
    </PageLayout>
  );
}
