import { http } from './http'

export type Patient = { id: string; email: string }
export type LoginSuccess = { token: string; patient: Patient }

export async function login(email: string, password: string): Promise<LoginSuccess> {
  return http<LoginSuccess>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined

export async function graphql<TData = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string
): Promise<TData> {
  if (!GRAPHQL_URL) {
    throw new Error('VITE_GRAPHQL_URL is not set. Create .env with VITE_GRAPHQL_URL')
  }
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (!res.ok) {
    const detail = json?.detail || res.statusText || 'Request failed'
    throw new Error(detail)
  }
  if (json.errors?.length) {
    throw new Error(json.errors[0])
  }
  return json.data as TData
}

