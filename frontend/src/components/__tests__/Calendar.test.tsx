// FE-004: Past Dates Selectable
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import Calendar from '../ui/Calendar'

describe('Calendar', () => {
  beforeEach(() => {
    // Fix "today" to April 15 2026 so we get predictable past/future dates
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('disables past dates', () => {
    render(<Calendar selectedDate={null} onDateSelect={vi.fn()} />)
    // April 14 is yesterday — must be disabled
    const pastBtn = screen.getByText('14')
    expect(pastBtn).toBeDisabled()
  })

  it('does not disable today', () => {
    render(<Calendar selectedDate={null} onDateSelect={vi.fn()} />)
    const todayBtn = screen.getByText('15')
    expect(todayBtn).not.toBeDisabled()
  })

  it('does not disable future dates', () => {
    render(<Calendar selectedDate={null} onDateSelect={vi.fn()} />)
    const futureBtn = screen.getByText('16')
    expect(futureBtn).not.toBeDisabled()
  })

  it('does not fire onDateSelect when a past date is clicked', () => {
    const onDateSelect = vi.fn()
    render(<Calendar selectedDate={null} onDateSelect={onDateSelect} />)
    fireEvent.click(screen.getByText('14'))
    expect(onDateSelect).not.toHaveBeenCalled()
  })

  it('fires onDateSelect when a future date is clicked', () => {
    const onDateSelect = vi.fn()
    render(<Calendar selectedDate={null} onDateSelect={onDateSelect} />)
    fireEvent.click(screen.getByText('16'))
    expect(onDateSelect).toHaveBeenCalled()
  })
})
