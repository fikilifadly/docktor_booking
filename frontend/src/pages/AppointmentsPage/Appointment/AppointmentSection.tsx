import React from "react";
import type { Appointment, Doctor } from "../../../types/index.types";
import { formatDateTime } from "../../../lib/timeSlotUtils";
import { CONFIRMATION_TYPE } from "../AppointmentsPage.config";

type Props = {
  title: string;
appointments: Appointment[];
  doctorMap: Map<string, Doctor>;
  emptyMessage: string;
  expandable?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onCancel?: (type: string, appointmentId: string, cancelDetail: string) => void;
  onReschedule?: (appointment: Appointment, doctor: Doctor) => void;
  onChangeDoctor?: (appointment: Appointment, doctor: Doctor) => void;
  className?: string;
};

const AppointmentSection: React.FC<Props> = ({
  title,
  appointments,
  doctorMap,
  emptyMessage,
  expandable = false,
  isOpen = true,
  onToggle,
  onCancel,
  onReschedule,
  onChangeDoctor,
  className = "",
}) => {
  if (!appointments.length) return null;

  const contentVisible = expandable ? isOpen : true;

  return (
    <div className="appointments-section">
      <div className={`appointments-section ${className}`}>
        {expandable ? (
          <button
            className="section-toggle"
            onClick={onToggle}
          >
            <h2 className="section-title">
              {title} ({appointments.length})
            </h2>
            <span className={`toggle-icon ${isOpen ? "expanded" : ""}`}>
              <span className="material-symbols-outlined">expand_more</span>
            </span>
          </button>
        ) : (
          <h2 className="section-title mb-4">
            {title} ({appointments.length})
          </h2>
        )}

        {contentVisible && (
          <div className="appointments-container">
            <div className="appointments-list">
              {appointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.startTime);
                const doctor = doctorMap.get(appointment.doctorId);

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
                      {onChangeDoctor && doctor && (
                        <button
                          onClick={() => onChangeDoctor(appointment, doctor)}
                          className="btn-change-appointment"
                        >
                          Change
                        </button>
                      )}

                      {onReschedule && doctor && (
                        <button
                          onClick={() => onReschedule(appointment, doctor)}
                          className="btn-reschedule-appointment"
                        >
                          Reschedule
                        </button>
                      )}

                      {onCancel && (
                        <button
                          onClick={() => {
                            const cancelDetail = `Appointment with ${doctor?.name || `Dr. ${appointment.doctorId}`} on ${date} at ${time}`;

                            onCancel(CONFIRMATION_TYPE.CANCEL.type, appointment.id, cancelDetail);
                          }}
                          className="btn-cancel-appointment"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!appointments.length && <p className="text-gray-500">{emptyMessage}</p>}
      </div>
    </div>
  );
};

export default AppointmentSection;
