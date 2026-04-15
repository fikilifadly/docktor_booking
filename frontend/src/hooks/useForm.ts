import { useState, useCallback } from 'react'
import { validateLoginForm, type ValidationError } from '../lib/validation'

export type FormState = {
  email: string
  password: string
  loading: boolean
  errors: Record<string, string>
  generalError: string
}

export type FormActions = {
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setLoading: (loading: boolean) => void
  setFieldError: (field: string, error: string) => void
  setGeneralError: (error: string) => void
  clearErrors: () => void
  validateForm: () => boolean
  reset: () => void
}

export function useForm() {
  const [state, setState] = useState<FormState>({
    email: '',
    password: '',
    loading: false,
    errors: {},
    generalError: ''
  })

  const setEmail = useCallback((email: string) => {
    setState(prev => ({
      ...prev,
      email,
      errors: { ...prev.errors, email: '' } // Clear field error when user types
    }))
  }, [])

  const setPassword = useCallback((password: string) => {
    setState(prev => ({
      ...prev,
      password,
      errors: { ...prev.errors, password: '' } // Clear field error when user types
    }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }))
  }, [])

  const setGeneralError = useCallback((error: string) => {
    setState(prev => ({ ...prev, generalError: error }))
  }, [])

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      generalError: ''
    }))
  }, [])

  const validateForm = useCallback((): boolean => {
    const validation = validateLoginForm(state.email, state.password)
    
    if (!validation.isValid) {
      const errors: Record<string, string> = {}
      validation.errors.forEach(error => {
        errors[error.field] = error.message
      })
      setState(prev => ({ ...prev, errors }))
      return false
    }
    
    return true
  }, [state.email, state.password])

  const reset = useCallback(() => {
    setState({
      email: '',
      password: '',
      loading: false,
      errors: {},
      generalError: ''
    })
  }, [])

  const actions: FormActions = {
    setEmail,
    setPassword,
    setLoading,
    setFieldError,
    setGeneralError,
    clearErrors,
    validateForm,
    reset
  }

  return { state, actions }
}
