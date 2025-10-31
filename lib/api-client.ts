/**
 * API Client utility for making authenticated requests
 */

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

/**
 * Make an authenticated API request
 * Automatically adds Authorization header with JWT token
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `Request failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * GET request helper
 */
export async function apiGet<T>(url: string): Promise<T> {
  return apiRequest<T>(url, { method: 'GET' })
}

/**
 * POST request helper
 */
export async function apiPost<T>(url: string, data?: any): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request helper
 */
export async function apiPut<T>(url: string, data?: any): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(url: string): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE' })
}

