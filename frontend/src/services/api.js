/**
 * StockSense API Service Client
 *
 * All frontend requests go through apiRequest(). It:
 *   - resolves endpoints against VITE_API_URL (default http://localhost:5000/api)
 *   - sends `Authorization: Bearer <token>` from localStorage['stocksense_token']
 *   - throws ApiError carrying the HTTP status and the backend's { error, details }
 *   - on 401 for a request that carried a token: clears the token and emits
 *     UNAUTHORIZED_EVENT so the router can send the user to LOGIN_PATH
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

export const TOKEN_STORAGE_KEY = 'stocksense_token'
export const LOGIN_PATH = '/login'
export const UNAUTHORIZED_EVENT = 'stocksense:unauthorized'

// localStorage can throw (private mode, blocked storage); treat that as "no token".
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // Storage unavailable: the session will simply not persist.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}

/**
 * Error thrown for any failed request.
 *   status  — HTTP status, or 0 when the server could not be reached
 *   message — the backend's `error` (or `message`) text when present
 *   details — the backend's `details` (or `errors`) payload, e.g. the
 *             requested/available list on a 409 "Insufficient stock"
 *   body    — the full parsed response body
 */
export class ApiError extends Error {
  constructor({ status, message, details = null, body = null, endpoint = '' }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.body = body
    this.endpoint = endpoint
  }

  get isNetworkError() { return this.status === 0 }
  get isBadRequest() { return this.status === 400 }
  get isUnauthorized() { return this.status === 401 }
  get isForbidden() { return this.status === 403 }
  get isNotFound() { return this.status === 404 }
  get isConflict() { return this.status === 409 }
  get isServerError() { return this.status >= 500 }
}

function buildUrl(endpoint, query) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${path}`
  if (!query) return url

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.append(key, String(value))
  }
  const search = params.toString()
  return search ? `${url}?${search}` : url
}

async function parseBody(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
  return text
}

/**
 * @param {string} endpoint  path under the API base, e.g. '/products'
 * @param {object} [options]
 * @param {string} [options.method='GET']
 * @param {object} [options.query]   query-string params; empty values are skipped
 * @param {*}      [options.body]    plain objects are sent as JSON
 * @param {boolean} [options.auth=true]  false = no token and no 401 redirect (e.g. login)
 * @param {object} [options.headers]
 * @param {AbortSignal} [options.signal]
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', query, body, auth = true, headers: extraHeaders, ...fetchOptions } = options

  const token = auth ? getToken() : null
  const isJsonBody = body !== undefined && body !== null && !(body instanceof FormData) && typeof body !== 'string'

  const headers = {
    Accept: 'application/json',
    ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }

  let response
  try {
    response = await fetch(buildUrl(endpoint, query), {
      ...fetchOptions,
      method,
      headers,
      body: isJsonBody ? JSON.stringify(body) : body,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError({
      status: 0,
      message: `Could not reach the StockSense API at ${API_BASE_URL}`,
      endpoint,
    })
  }

  const data = await parseBody(response)

  if (!response.ok) {
    const payload = data && typeof data === 'object' ? data : null

    // Only an expired/invalid session triggers the redirect. A request sent
    // without a token cannot, which prevents a redirect loop.
    if (response.status === 401 && token) {
      clearToken()
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: { endpoint } }))
    }

    throw new ApiError({
      status: response.status,
      message:
        payload?.error ||
        payload?.message ||
        (typeof data === 'string' && data.trim() ? data.trim() : `Request failed with status ${response.status}`),
      details: payload?.details ?? payload?.errors ?? null,
      body: data,
      endpoint,
    })
  }

  return data
}
