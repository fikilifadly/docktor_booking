## Frontend Features

### FEF-001: Doctor Availability Integration
- **Feature**: Replace the hardcoded local time slots with a real call to the backend GraphQL query, so the booking modal always shows the actual available slots for the selected doctor and date.
- **Impact**: Time slots currently shown are hardcoded on the client and never reflect the doctor's real schedule. Any backend change to available hours is invisible to users, and two independent slot systems exist with no synchronisation.

### FEF-002: Doctor Schedule View
- **Feature**: Add a dedicated view (page or expandable panel) where a patient can browse a doctor's full schedule for a selected date, showing which time slots are taken and which are free, before committing to a booking.
- **Impact**: Currently there is no way for a patient to see a doctor's availability without entering the multi-step booking flow. This feature surfaces that information upfront.

### FEF-003: Change Doctor on a Booked Appointment
- **Feature**: Allow a patient to change the doctor on an existing scheduled appointment to another available doctor, without having to cancel and re-book manually.
- **Impact**: Patients currently have no way to reassign a booking to a different doctor short of cancellation. The backend mutation is implemented and ready to integrate.

### FEF-004: Reschedule a Booked Appointment
- **Feature**: Allow a patient to move an existing scheduled appointment to a new date and/or time while keeping all other details (doctor, notes) intact.
- **Impact**: Patients currently have no way to adjust a booking's time short of cancellation. The backend mutation is implemented and ready to integrate.

---

## Bonus Features

### FEF-005: Past Appointments Section
- **Feature**: Add a collapsible "Past Appointments" section to the appointments page that displays appointments whose scheduled time has already passed, separate from the active upcoming list.
- **Impact**: Past appointments are currently mixed into the "Scheduled" section with no visual distinction, making it hard to distinguish upcoming from completed visits. The backend already returns all appointments — this is a frontend-only change.

### FEF-006: Custom Booking Notes
- **Feature**: Add an optional free-text notes field in the booking modal (Step 2) so patients can describe their reason for the visit before confirming.
- **Impact**: Notes are currently auto-generated as `"Appointment with Dr. X (Specialty)"`. Patients have no way to communicate the purpose of their visit. The backend `createAppointment` mutation already accepts a `notes` argument — this is a frontend-only change.

### FEF-007: React Native Mobile App
- **Feature**: Build a React Native version of the same appointment booking application, targeting iOS and Android, stored in the `mobile/` folder. UI designs are provided in `design/mobile/`.
- **Impact**: There is currently no mobile-native version of the application. The same backend GraphQL API can be reused without modification.
