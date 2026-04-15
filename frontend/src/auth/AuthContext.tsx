import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { login as apiLogin, type Patient } from '../lib/api'

type AuthContextValue = {
  token: string | null
  patient: Patient | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'auth_token'
const PATIENT_KEY = 'auth_patient'

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedPatient = localStorage.getItem(PATIENT_KEY)
      if (savedToken) setToken(savedToken)
      if (savedPatient) setPatient(JSON.parse(savedPatient) as Patient)
    } catch {
      // ignore
    }
  }, [])

  const doLogin = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    setToken(res.token)
    setPatient(res.patient)
    try {
      localStorage.setItem(TOKEN_KEY, res.token)
      localStorage.setItem(PATIENT_KEY, JSON.stringify(res.patient))
    } catch {
      // ignore
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setPatient(null)
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(PATIENT_KEY)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    token,
    patient,
    isAuthenticated: Boolean(token),
    login: doLogin,
    logout,
  }), [token, patient, doLogin, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


