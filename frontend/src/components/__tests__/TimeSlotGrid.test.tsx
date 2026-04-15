// FE-001: Disabled Slots Clickable
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import TimeSlotGrid from '../ui/TimeSlotGrid'

describe('TimeSlotGrid', () => {
  it('renders available slots as enabled', () => {
    const slots = [{ time: '10:00 AM', available: true, booked: false }]
    render(<TimeSlotGrid selectedTime={null} onTimeSelect={vi.fn()} slots={slots} />)
    expect(screen.getByText('10:00 AM')).not.toBeDisabled()
  })

  it('renders unavailable slots as disabled', () => {
    const slots = [{ time: '11:00 AM', available: false, booked: true, reason: 'Already booked' }]
    render(<TimeSlotGrid selectedTime={null} onTimeSelect={vi.fn()} slots={slots} />)
    expect(screen.getByText('11:00 AM')).toBeDisabled()
  })

  it('does not call onTimeSelect when an unavailable slot is clicked', () => {
    const onTimeSelect = vi.fn()
    const slots = [{ time: '11:00 AM', available: false, booked: true }]
    render(<TimeSlotGrid selectedTime={null} onTimeSelect={onTimeSelect} slots={slots} />)
    fireEvent.click(screen.getByText('11:00 AM'))
    expect(onTimeSelect).not.toHaveBeenCalled()
  })

  it('calls onTimeSelect when an available slot is clicked', () => {
    const onTimeSelect = vi.fn()
    const slots = [{ time: '10:00 AM', available: true, booked: false }]
    render(<TimeSlotGrid selectedTime={null} onTimeSelect={onTimeSelect} slots={slots} />)
    fireEvent.click(screen.getByText('10:00 AM'))
    expect(onTimeSelect).toHaveBeenCalledWith('10:00 AM')
  })
})
