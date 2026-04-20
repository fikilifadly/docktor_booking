export type ValidationError = {
  field: string
  message: string
}

export type ValidationResult = {
  isValid: boolean
  errors: ValidationError[]
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'Email is required'
  }
  
  const emailRegex = /^\S+@\S+\.\S+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required'
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters'
  }
  
  return null
}

export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: ValidationError[] = []
  
  const emailError = validateEmail(email)
  if (emailError) {
    errors.push({ field: 'email', message: emailError })
  }
  
  const passwordError = validatePassword(password)
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
