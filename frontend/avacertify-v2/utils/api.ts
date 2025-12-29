import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API functions
export const authAPI = {
  signup: (data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    institutionId?: string
  }) => api.post('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),

  updateProfile: (data: {
    firstName?: string
    lastName?: string
    institutionId?: string
  }) => api.put('/auth/profile', data),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  getAuthLogs: (params?: {
    page?: number
    limit?: number
    event?: string
    userId?: string
  }) => api.get('/auth/logs', { params }),
}

// Institution API functions
export const institutionAPI = {
  create: (data: any) => api.post('/institutions', data),

  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/institutions', { params }),

  getById: (id: string) => api.get(`/institutions/${id}`),

  update: (id: string, data: any) => api.put(`/institutions/${id}`, data),

  delete: (id: string) => api.delete(`/institutions/${id}`),

  addDocument: (id: string, data: { name: string; type: string; url: string }) =>
    api.post(`/institutions/${id}/documents`, data),

  removeDocument: (id: string, documentId: string) =>
    api.delete(`/institutions/${id}/documents/${documentId}`),
}

export default api