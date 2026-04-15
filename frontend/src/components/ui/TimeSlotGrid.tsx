import './TimeSlotGrid.css'
import type { TimeSlot } from '../../lib/timeSlotUtils'

type TimeSlotGridProps = {
  selectedTime: string | null
  onTimeSelect: (time: string) => void
  slots: TimeSlot[]
  className?: string
}

export default function TimeSlotGrid({ 
  selectedTime, 
  onTimeSelect, 
  slots,
  className = '' 
}: TimeSlotGridProps) {
  const handleTimeClick = (time: string, available: boolean) => {
    if (available) {
      onTimeSelect(time)
    }
  }

  return (
    <div className={`time-slot-grid ${className}`}>
      <div className="time-slot-container">
        <div className="time-slot-buttons">
          {slots.map((slot) => (
            <button
              key={slot.time}
              className={`time-slot-btn ${
                selectedTime === slot.time ? 'selected' : ''
              } ${
                !slot.available ? 'disabled' : ''
              } ${
                slot.booked ? 'booked' : ''
              }`}
              onClick={() => handleTimeClick(slot.time, slot.available)}
              type="button"
              title={slot.reason || undefined}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}