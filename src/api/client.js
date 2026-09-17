const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const TOKEN_KEY = 'logify_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// path e.g. '/auth/login'. method defaults to GET. body gets JSON-stringified.
// Returns parsed JSON on success. Throws an Error with a `.status` on failure,
// so callers can check err.status === 404 to mean "not found yet" vs a real error.
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // no JSON body — fine for some responses
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed with status ${res.status}`)
    error.status = res.status
    throw error
  }

  return data
}