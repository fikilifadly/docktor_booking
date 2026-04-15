import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { AuthProvider } from '../AuthContext'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock the API login function
vi.mock('../../lib/api', () => ({
  login: vi.fn().mockResolvedValue({
    token: 'mock-token',
    patient: { id: 'patient-1', email: 'test@example.com' }
  })
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should initialize with no authentication', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBe(null)
    expect(result.current.patient).toBe(null)
  })

  it('should load authentication from localStorage on mount', () => {
    const savedToken = 'saved-token'
    const savedPatient = { id: 'patient-1', email: 'test@example.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(savedToken)
      .mockReturnValueOnce(JSON.stringify(savedPatient))
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.token).toBe(savedToken)
    expect(result.current.patient).toEqual(savedPatient)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle login successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('mock-token')
    expect(result.current.patient).toEqual({ id: 'patient-1', email: 'test@example.com' })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_patient', JSON.stringify({ id: 'patient-1', email: 'test@example.com' }))
  })

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // First login
    act(() => {
      result.current.login('test@example.com', 'password')
    })
    
    // Then logout
    act(() => {
      result.current.logout()
    })
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBe(null)
    expect(result.current.patient).toBe(null)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_patient')
  })
})
