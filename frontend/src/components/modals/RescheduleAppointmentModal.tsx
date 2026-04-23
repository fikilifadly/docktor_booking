import { useEffect, useState } from "react";
import Calendar from "../ui/Calendar";
import TimeSlotGrid from "../ui/TimeSlotGrid";
import useDoctorAvailability from "../../hooks/useDoctorAvailability";
import "./RescheduleAppointmentModal.css";
import { calculateTimeSlotAvailability } from "../../lib/timeSlotUtils";
import type { Appointment } from "../../types/index.types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointmentId: string, newDate: Date, newTime: string) => void;
  appointmentId: string;
  appointments: Appointment[];
  doctorId: string;
  initialDate: Date;
  initialTime: string;
};

export default function RescheduleAppointmentModal({ isOpen, onClose, onConfirm, appointmentId, doctorId, initialDate, initialTime, appointments }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime);
  const { availability, loading } = useDoctorAvailability(doctorId, selectedDate);
  console.log("availability", availability);
  const selectedDoctorAppointments = appointments.filter((apt: Appointment) => apt.doctorId === doctorId);
  const slots = calculateTimeSlotAvailability(selectedDoctorAppointments, availability, selectedDate);

  useEffect(() => {
  if (isOpen) {
    setSelectedDate(initialDate);
    setSelectedTime(initialTime);
  }
}, [isOpen, initialDate, initialTime]);

  console.log("selectedDate", selectedDate, slots);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-reschedule-content">
        <h2>Reschedule Appointment</h2>
        <span>current appointment date: {initialDate.toLocaleDateString()}</span>
        <span>current appointment time: {initialTime}</span>

        <Calendar
          selectedDate={selectedDate}
          onDateSelect={(date: Date) => {
            setSelectedDate(date);
            setSelectedTime(null);
          }}
        />

        {(!loading && (selectedDate instanceof Date && !!selectedDate)) && (
          <>
            <p>choose preffered time</p>
            <TimeSlotGrid
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              slots={slots}
            />
          </>
        )}



        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn-primary"
            disabled={!selectedDate || !selectedTime}
            onClick={() => {
              if (!selectedDate || !selectedTime) return;

              onConfirm(appointmentId, selectedDate, selectedTime);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
