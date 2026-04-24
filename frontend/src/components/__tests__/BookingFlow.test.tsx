import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../test/utils";
import TimeSlotSelectionModal from "../modals/TimeSlotSelectionModal";

// Mock the current time to be 10:00 AM so time slots are available
const mockDate = new Date();
vi.setSystemTime(mockDate);

// Mock the useBookAppointment hook
const mockBookAppointment = vi.fn();
vi.mock("../../hooks/useBookAppointment", () => ({
  useBookAppointment: () => ({
    bookAppointment: mockBookAppointment,
    loading: false,
    error: "",
  }),
}));
vi.mock("../../lib/timeSlotUtils", () => ({
  calculateTimeSlotAvailability: () => [
    { time: "11:00 AM", available: true },
    { time: "12:00 PM", available: true },
  ],
}));

// Mock the useAppointmentsByDoctor hook
vi.mock("../../hooks/useAppointmentsByDoctor", () => ({
  useAppointmentsByDoctor: () => ({
    appointments: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const mockDoctor = {
  id: "doctor-1",
  name: "Dr. Amelia Chen",
  specialty: "Internal Medicine",
  avatarUrl: "https://example.com/doctor1.jpg",
};

describe("Booking Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete the booking flow successfully", async () => {
    mockBookAppointment.mockResolvedValue({
      success: true,
      appointmentId: "appointment-1",
    });

    render(
      <TimeSlotSelectionModal
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
        selectedDoctor={mockDoctor}
      />,
    );

    expect(screen.getByText("New Appointment")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 2: Choose date & time")).toBeInTheDocument();
    expect(screen.getByText("Dr. Amelia Chen")).toBeInTheDocument();
    expect(screen.getByText("Internal Medicine")).toBeInTheDocument();
    expect(screen.getByText("Select a Date")).toBeInTheDocument();
    expect(screen.queryByText("Choose a Time")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("27"));

    expect(await screen.findByText("Choose a Time")).toBeInTheDocument();

    fireEvent.click(await screen.findByText("11:00 AM"));

    const confirmButton = screen.getByRole("button", {
      name: /create appointment/i,
    });

    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockBookAppointment).toHaveBeenCalledWith({
        doctor: mockDoctor,
        date: expect.any(Date),
        time: "11:00 AM",
        notes: "",
      });
    });
  });

  it("should handle booking errors", async () => {
    mockBookAppointment.mockResolvedValue({
      success: false,
      error: "Slot already booked for this doctor",
    });

    render(
      <TimeSlotSelectionModal
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
        selectedDoctor={mockDoctor}
      />,
    );

    // Select tomorrow's date (27th) which should be available
    const tomorrowButton = screen.getByText("27");
    fireEvent.click(tomorrowButton);

    const timeSlot = screen.getByText("11:00 AM");
    fireEvent.click(timeSlot);

    // Click confirm button
    const confirmButton = screen.getByText("Create Appointment");
    fireEvent.click(confirmButton);

    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByText("Slot already booked for this doctor")).toBeInTheDocument();
    });
  });

  it("should disable confirm button when no date or time is selected", () => {
    render(
      <TimeSlotSelectionModal
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
        selectedDoctor={mockDoctor}
      />,
    );

    const confirmButton = screen.getByText("Create Appointment");
    expect(confirmButton).toBeDisabled();
  });

  it("should complete booking flow and call callbacks after confirmation close", async () => {
    const mockOnClose = vi.fn();
    const mockOnSuccessBooked = vi.fn();

    mockBookAppointment.mockResolvedValue({
      success: true,
      appointmentId: "appointment-1",
    });

    render(
      <TimeSlotSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onBack={vi.fn()}
        selectedDoctor={mockDoctor}
        onSuccessBooked={mockOnSuccessBooked}
      />,
    );

    fireEvent.click(screen.getByText("27"));
    const timeSlot = await screen.findByRole("button", {
      name: /11:00 AM/i,
    });
    fireEvent.click(timeSlot);
    fireEvent.click(screen.getByRole("button", { name: /create appointment/i }));

    await waitFor(() => {
      expect(mockBookAppointment).toHaveBeenCalled();
    });

    const confirmationTitle = await screen.findByText(/appointment confirmed/i);
    expect(confirmationTitle).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /done/i }));

    await waitFor(() => {
      expect(mockOnSuccessBooked).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
