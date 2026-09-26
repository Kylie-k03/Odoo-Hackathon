/**
 * StockSense API Service Client
 * 
 * Modular API client prepared for Member 2 (Backend Core) and Member 3 (Auth) integration.
 * In development, defaults to VITE_API_URL or http://localhost:5000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('stocksense_token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API Request failed with status ${response.status}`)
  }

  return response.json()
}
