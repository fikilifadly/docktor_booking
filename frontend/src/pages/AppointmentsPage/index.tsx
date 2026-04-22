import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "../../features/appointments/hooks/useAppointments";
import { useDoctors } from "../../features/appointments/hooks/useDoctors";
import { useCancelAppointment } from "../../hooks/useCancelAppointment";
import { BookAppointmentModal } from "../../components";
import { PageLayout, PageContainer } from "../../components/layout";
import { useAuth } from "../../auth/useAuth";
import "./styles.css";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import type { ConfirmationType } from "./AppointmentsPage.config";
import { CONFIRMATION_TYPE } from "./AppointmentsPage.config";
import { toast } from "react-toastify";
import { getConfirmationTitleMessage } from "./AppointmentPage.utils";

export default function AppointmentsPage() {
  const { loading, error, appointments, refetch } = useAppointments();
  const { doctors } = useDoctors();
  const { cancelAppointment, loading: cancelLoading } = useCancelAppointment();
  const { logout, patient } = useAuth();
  const navigate = useNavigate();

  const [confirmationStateModal, setConfirmationStateModal] = useState<{
    isOpen: boolean;
    type: ConfirmationType | null;
    appointmentId?: string;
    prevState?: string;
    newState?: string;
  }>({
    isOpen: false,
    type: null,
  });

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

  const handleOnConfirmActionModal = async () => {
    if (!confirmationStateModal.type || !confirmationStateModal.appointmentId) return;

    try {
      switch (confirmationStateModal.type) {
        case CONFIRMATION_TYPE.LOGOUT.type:
          logout();
          navigate("/login");
          break;
        case CONFIRMATION_TYPE.CANCEL.type:
          await cancelAppointment(confirmationStateModal.appointmentId);
          toast.success(CONFIRMATION_TYPE.CANCEL.toastSuccess);
          break;
        case CONFIRMATION_TYPE.CHANGE_DOCTOR.type:
          // Implement change doctor logic here, e.g. call changeDoctor API
          toast.success(CONFIRMATION_TYPE.CHANGE_DOCTOR.toastSuccess);
          break;
        case CONFIRMATION_TYPE.RESCHEDULE.type:
          // Implement reschedule logic here, e.g. call reschedule API
          toast.success(CONFIRMATION_TYPE.RESCHEDULE.toastSuccess);
          break;
        default:
          break;
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
  const [isModalLogoutOpen, setIsModalLogoutOpen] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const upcomingAppointments = appointments.filter((apt) => apt.status !== "cancelled");
  const hasUpcomingAppointments = upcomingAppointments.length > 0;
  const hasAnyAppointments = appointments.length > 0;

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
        timeZone: 'UTC',
      }),
      time: date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: 'UTC',
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

        {!loading && !error && hasAnyAppointments && (
          <div className="appointments-sections">
            {/* Upcoming Appointments */}
            {appointments.filter((apt) => apt.status !== "cancelled").length > 0 && (
              <div className="appointments-section">
                <h2 className="section-title">Scheduled Appointments</h2>
                <div className="appointments-container">
                  <div className="appointments-list">
                    {appointments
                      .filter((appointment) => appointment.status !== "cancelled")
                      .map((appointment) => {
                        console.log("mapping appointment", appointment);
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
                                onClick={handleOpenConfirmationModal(CONFIRMATION_TYPE.CHANGE_DOCTOR.type, appointment.id, cancelDetail, "another doctor")}
                                disabled={cancelLoading}
                              >
                                {cancelLoading ? "Changing Doctor..." : "Change Doctor"}
                              </button>
                              <button
                                className="btn-reschedule-appointment"
                                onClick={handleOpenConfirmationModal(CONFIRMATION_TYPE.RESCHEDULE.type, appointment.id, cancelDetail)}
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
            {appointments.filter((apt) => apt.status === "cancelled").length > 0 && (
              <div className="appointments-section cancelled-appointments-section">
                <button
                  className="section-toggle"
                  onClick={() => setShowCancelled(!showCancelled)}
                >
                  <h2 className="section-title">Cancelled ({appointments.filter((apt) => apt.status === "cancelled").length})</h2>
                  <span className={`toggle-icon ${showCancelled ? "expanded" : ""}`}>
                    <span className="material-symbols-outlined">expand_more</span>
                  </span>
                </button>
                {showCancelled && (
                  <div className="appointments-container">
                    <div className="appointments-list">
                      {appointments
                        .filter((appointment) => appointment.status === "cancelled")
                        .map((appointment) => {
                          const { date, time } = formatDateTime(appointment.startTime);
                          const doctor = doctorMap.get(appointment.doctorId);

                          return (
                            <div
                              key={appointment.id}
                              className="appointment-row cancelled"
                            >
                              <div className="appointment-doctor-info">
                                <p className="doctor-name">{doctor?.name || `Dr. ${appointment.doctorId}`}</p>
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
                )}
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
        {...getConfirmationTitleMessage(confirmationStateModal.type ?? "", confirmationStateModal.prevState)}
      />
      {/* <ChangeAppointmentModal
        isOpen={isModalChangeOpen}
        onClose={handleToggleChangeAppointmentModal}
        appointment={selectedAppointment}
        doctors={availableDoctors}
        onSuccessChange={refetch}
      /> */}
    </PageLayout>
  );
}
