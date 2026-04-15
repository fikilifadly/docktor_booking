// FE-002: Weak Email Validation
import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, validateLoginForm } from '../validation'

describe('validateEmail', () => {
  it('accepts a standard valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull()
  })

  it('accepts emails with subdomains', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBeNull()
  })

  it('rejects an email with no domain extension (e.g. "user@nodomain")', () => {
    expect(validateEmail('user@nodomain')).not.toBeNull()
  })

  it('rejects an email missing the domain entirely (e.g. "user@")', () => {
    expect(validateEmail('user@')).not.toBeNull()
  })

  it('rejects an email missing the @ sign', () => {
    expect(validateEmail('userexample.com')).not.toBeNull()
  })

  it('rejects an empty string', () => {
    expect(validateEmail('')).not.toBeNull()
  })

  it('rejects an email with spaces', () => {
    expect(validateEmail('user @example.com')).not.toBeNull()
  })

  it('rejects a whitespace-only string', () => {
    expect(validateEmail('   ')).not.toBeNull()
  })
})

describe('validatePassword', () => {
  it('accepts a password with 6 or more characters', () => {
    expect(validatePassword('secret')).toBeNull()
  })

  it('rejects an empty password', () => {
    expect(validatePassword('')).not.toBeNull()
  })

  it('rejects a password shorter than 6 characters', () => {
    expect(validatePassword('abc')).not.toBeNull()
  })
})

describe('validateLoginForm', () => {
  it('returns isValid=true when both fields are valid', () => {
    const result = validateLoginForm('user@example.com', 'password123')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns an email error for an invalid email', () => {
    const result = validateLoginForm('user@', 'password123')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'email')).toBe(true)
  })

  it('returns a password error for a short password', () => {
    const result = validateLoginForm('user@example.com', 'abc')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.field === 'password')).toBe(true)
  })

  it('returns both errors when both fields are invalid', () => {
    const result = validateLoginForm('bad', 'ab')
    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })
})
