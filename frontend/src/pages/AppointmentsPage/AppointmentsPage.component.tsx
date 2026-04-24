import { BookAppointmentModal } from "../../components";
import { PageLayout, PageContainer } from "../../components/layout";
import "./styles.css";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import { CONFIRMATION_TYPE } from "./AppointmentsPage.config";
import { getConfirmationTitleMessage } from "./AppointmentsPage.utils";
import ChangeDoctorModal from "../../components/modals/ChangeDoctorModal";
import RescheduleAppointmentModal from "../../components/modals/RescheduleAppointmentModal";
import useAppointmentPage from "./AppointmentsPage.hook";
import AppointmentHeader from "./Appointment/AppointmentHeader";
import AppointmentSection from "./Appointment/AppointmentSection";
import type { Doctor } from "../../types/index.types";
import AppointmentEmptyState from "./Appointment/AppointmentEmptyState";
import Loader from "../../components/ui/Loader";

export default function AppointmentsPage() {
  const {
    handleOnConfirmActionModal,
    handleToggleBookAppointmentModal,
    handleOpenConfirmationModal,
    handleCloseConfirmationModal,
    handleConfirmReschedule,
    handleSelectNewDoctor,
    upcomingAppointments,
    doctorMap,
    appointments,
    isModalAppointmentOpen,
    refetch,
    confirmationStateModal,
    doctors,
    isChangeDoctorOpen,
    selectedAppointment,
    handleToggleDoctorModal,
    isModalRescheduleOpen,
    handleOnCloseRescheduleModal,
    cancelledAppointments,
    isShowCancelled,
    setIsShowCancelled,
    isShowPast,
    setIsShowPast,
    pastAppointments,
    handleOnChangeDoctorButton,
    handleOnRescheduleButton,
    hasUpcomingAppointments,
    loadingAppointments,
  } = useAppointmentPage();

  const headerActions = (
    <button
      className="btn-logout"
      onClick={() => handleOpenConfirmationModal(CONFIRMATION_TYPE.LOGOUT.type, "")}
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
        <AppointmentHeader onBook={handleToggleBookAppointmentModal} />
        {loadingAppointments ? (
          <Loader />
        ) : !hasUpcomingAppointments ? (
          <AppointmentEmptyState />
        ) : (
          <>
            <AppointmentSection
              title="Scheduled Appointments"
              appointments={upcomingAppointments}
              doctorMap={doctorMap}
              emptyMessage="No upcoming appointments."
              onCancel={handleOpenConfirmationModal}
              onReschedule={handleOnRescheduleButton}
              onChangeDoctor={handleOnChangeDoctorButton}
            />
          </>
        )}
        <AppointmentSection
          title="Cancelled"
          appointments={cancelledAppointments}
          doctorMap={doctorMap}
          emptyMessage="No cancelled appointments."
          expandable
          isOpen={isShowCancelled}
          onToggle={() => setIsShowCancelled((prev: boolean) => !prev)}
          className="cancelled-appointments-section"
        />
        <AppointmentSection
          title="Past Appointments"
          appointments={pastAppointments}
          doctorMap={doctorMap}
          emptyMessage="No past appointments."
          expandable
          isOpen={isShowPast}
          onToggle={() => setIsShowPast((prev: boolean) => !prev)}
          className="cancelled-appointments-section"
        />
      </PageContainer>
      <BookAppointmentModal
        isOpen={isModalAppointmentOpen}
        onClose={handleToggleBookAppointmentModal}
        onSuccessBooked={refetch}
        appointments={appointments}
        doctors={doctors}
      />
      <ConfirmationModal
        isOpen={confirmationStateModal?.isOpen ?? false}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleOnConfirmActionModal}
        {...getConfirmationTitleMessage(confirmationStateModal?.type ?? "", confirmationStateModal?.prevState, confirmationStateModal?.newState)}
      />
      <ChangeDoctorModal
        isOpen={isChangeDoctorOpen}
        onClose={handleToggleDoctorModal}
        onConfirm={handleSelectNewDoctor}
        availableDoctors={doctors.filter((doctor: Doctor) => selectedAppointment?.speciality === doctor.specialty)}
        currentDoctorName={selectedAppointment?.doctorName || ""}
      />
      <RescheduleAppointmentModal
        isOpen={isModalRescheduleOpen}
        onClose={handleOnCloseRescheduleModal}
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
