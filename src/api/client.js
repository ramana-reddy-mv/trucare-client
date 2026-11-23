import axios from 'axios'
import { config } from '../config'

export const api = axios.create({ baseURL: config.apiBaseUrl, timeout: 12000, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((request) => {
  const token = sessionStorage.getItem('trucare.accessToken')
  if (token) request.headers.Authorization = `Bearer ${token}`
  return request
})

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    sessionStorage.removeItem('trucare.accessToken')
    sessionStorage.removeItem('trucare.expiresAt')
    window.dispatchEvent(new Event('trucare:unauthorized'))
  }
  return Promise.reject(error)
})

export function getErrorMessage(error) {
  const data = error?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (error?.code === 'ERR_NETWORK') return 'Could not reach the TruCare API. Check that the API Gateway is running.'
  return error?.message || 'Something went wrong. Please try again.'
}

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (details) => api.post('/auth/register', details),
}

export const claimsApi = {
  getById: (claimId) => api.get(`/api/claims/${encodeURIComponent(claimId)}`),
  getByIdForService: (claimId) => api.get(`/api/claims/by-claim-id/${encodeURIComponent(claimId)}`),
  search: (params) => api.get('/api/claims', { params }),
  dashboardSummary: () => api.get('/api/claims/dashboard/summary'),
  create: (claim, idempotencyKey) => api.post('/api/claims', claim, { headers: { 'Idempotency-Key': idempotencyKey } }),
}

export const membersApi = {
  list: () => api.get('/api/members'),
  getById: (memberId) => api.get(`/api/members/${encodeURIComponent(memberId)}`),
  create: (member) => api.post('/api/members/addMember', member),
}

export const notificationsApi = {
  unreadInApp: (recipientId) => api.get(`/api/notifications/in-app/${encodeURIComponent(recipientId)}/unread`, { params: { page: 0, size: 10 } }),
  markRead: (notificationId) => api.post(`/api/notifications/${notificationId}/read`),
}

export const gatewayApi = {
  health: () => api.get('/actuator/health', { validateStatus: (status) => status < 500 || status === 503 }),
  serviceHealth: (service) => api.get(`/monitoring/${service}/health`, { validateStatus: (status) => status < 500 || status === 503 }),
}
