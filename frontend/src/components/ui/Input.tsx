import React from 'react'
import './Input.css'

type InputProps = {
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  className?: string
}

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  autoComplete,
  className = ''
}: InputProps) {
  const hasError = Boolean(error)
  
  return (
    <div className={`input-wrapper ${className}`}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={`input ${hasError ? 'input-error' : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${type}-error` : undefined}
      />
      {hasError && (
        <div 
          id={`${type}-error`}
          className="input-error-message" 
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  )
}
