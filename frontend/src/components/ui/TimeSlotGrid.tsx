import './TimeSlotGrid.css'
import type { TimeSlot } from '../../lib/timeSlotUtils'

type TimeSlotGridProps = {
  selectedTime?: string | null
  onTimeSelect: (time: string) => void
  slots: TimeSlot[]
  className?: string
  clickAble?: boolean
}

export default function TimeSlotGrid({ 
  selectedTime, 
  onTimeSelect, 
  slots,
  className = '',
  clickAble = true,
}: TimeSlotGridProps) {
console.log('Rendering TimeSlotGrid with slots:', slots, 'selectedTime:', selectedTime)
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
              disabled={!slot.available || !clickAble}
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