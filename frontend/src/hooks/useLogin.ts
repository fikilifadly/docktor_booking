import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { login as apiLogin } from '../lib/api'

export type LoginError = {
  type: 'validation' | 'network' | 'auth' | 'unknown'
  message: string
  field?: string
}

export function useLogin() {
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const login = useCallback(async (
    email: string, 
    password: string,
    onError: (error: LoginError) => void,
    onSuccess: () => void
  ) => {
    try {
      await authLogin(email, password)
      onSuccess()
      navigate('/appointments')
    } catch (error) {
      let loginError: LoginError

      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        
        if (message.includes('network') || message.includes('fetch')) {
          loginError = {
            type: 'network',
            message: 'Network error. Please check your connection and try again.'
          }
        } else if (message.includes('unauthorized') || message.includes('invalid') || message.includes('credentials')) {
          loginError = {
            type: 'auth',
            message: 'Invalid email or password. Please try again.'
          }
        } else if (message.includes('email')) {
          loginError = {
            type: 'validation',
            message: 'Please enter a valid email address.',
            field: 'email'
          }
        } else {
          loginError = {
            type: 'unknown',
            message: 'Login failed. Please try again.'
          }
        }
      } else {
        loginError = {
          type: 'unknown',
          message: 'An unexpected error occurred. Please try again.'
        }
      }

      onError(loginError)
    }
  }, [authLogin, navigate])

  return { login }
}
