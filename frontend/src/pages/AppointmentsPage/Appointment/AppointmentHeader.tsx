type Props = {
  onBook: () => void;
};

const AppointmentHeader = ({ onBook }: Props) => (
  <div className="appts-header-row">
    <div>
      <h1 className="appts-title">Upcoming Appointments</h1>
      <p className="appts-subtitle">Here are your scheduled appointments.</p>
    </div>

    <div className="appts-actions">
      <button
        className="appts-cta"
        onClick={onBook}
      >
        Book an Appointment
      </button>
    </div>
  </div>
);

export default AppointmentHeader;