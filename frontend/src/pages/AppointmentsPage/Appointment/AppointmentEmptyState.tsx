const AppointmentEmptyState = () => (
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
);

export default AppointmentEmptyState