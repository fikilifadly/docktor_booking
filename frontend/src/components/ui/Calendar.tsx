import React, { useState } from 'react'
import './Calendar.css'

type CalendarProps = {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  className?: string
}

export default function Calendar({ selectedDate, onDateSelect, className = '' }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  const handleDateClick = (date: Date) => {
    if (!isPastDate(date)) {
      onDateSelect(date)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className={`calendar ${className}`}>
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn" 
          onClick={goToPreviousMonth}
          type="button"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h3 className="calendar-month">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button 
          className="calendar-nav-btn" 
          onClick={goToNextMonth}
          type="button"
        >
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        {days.map((date, index) => (
          <div key={index} className="calendar-day-cell">
            {date ? (
              <button
                className={`calendar-day-btn ${
                  isSelected(date) ? 'selected' : ''
                } ${
                  isPastDate(date) ? 'disabled' : ''
                } ${
                  isToday(date) ? 'today' : ''
                }`}
                onClick={() => handleDateClick(date)}
                type="button"
              >
                {date.getDate()}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
