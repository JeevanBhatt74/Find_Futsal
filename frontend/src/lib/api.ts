import axios from 'axios'
import { useAuthStore } from '@/store'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Sync token from Zustand instead of localstorage directly to prevent desync
    const token = useAuthStore.getState().token || localStorage.getItem('ff_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ff_token')
      useAuthStore.getState().clearAuth() // Clear Zustand state too
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
