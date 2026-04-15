const API_BASE = import.meta.env.VITE_API_BASE as string | undefined

export type Json = Record<string, unknown> | null

export async function http<TResponse = unknown>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<TResponse> {
  if (!API_BASE) {
    throw new Error('VITE_API_BASE is not set. Create .env with VITE_API_BASE')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body: Json = isJson ? await response.json() : null

  if (!response.ok) {
    const message = (body as { detail?: string } | null)?.detail || response.statusText || 'Request failed'
    throw new Error(message)
  }

  return body as TResponse
}


