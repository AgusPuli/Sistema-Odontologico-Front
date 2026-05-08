import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { ApiError, ErrorCode } from '@/types/api.types'
import { clearQueryCache } from '@/lib/query-client'

/**
 * Single shared axios instance.
 *
 * Conventions enforced here so feature modules don't have to repeat them:
 *  - `Authorization: Bearer <token>` from the auth store on every request.
 *  - `X-Tenant-ID: <user.tenantId>` so the backend can resolve multi-tenancy
 *    (the backend's TenantInterceptor reads this header).
 *  - One-shot token refresh on 401, with a queue so concurrent in-flight
 *    requests share a single refresh attempt.
 *  - Errors normalized to {@link ApiError}: feature hooks handle a single shape.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error || !token) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}

// REQUEST -----------------------------------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { token, user } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (user?.tenantId) config.headers['X-Tenant-ID'] = user.tenantId
  return config
})

// RESPONSE ----------------------------------------------------------------
api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    // Network / no-response errors: normalize and bail
    if (!error.response) {
      const apiError: ApiError = {
        success: false,
        errorCode: error.request ? ErrorCode.NETWORK_ERROR : ErrorCode.UNKNOWN_ERROR,
        message: error.request
          ? 'No se pudo conectar con el servidor. Verificá tu conexión.'
          : error.message || 'Error desconocido',
        status: 0,
      }
      return Promise.reject(apiError)
    }

    const { status, data } = error.response
    const body = (data ?? {}) as Partial<ApiError> & { errorCode?: string; message?: string }

    const apiError: ApiError = {
      success: false,
      errorCode: body.errorCode || ErrorCode.UNKNOWN_ERROR,
      message: body.message || error.message || 'Error desconocido',
      data: (body as { data?: unknown }).data ?? data ?? null,
      status,
      timestamp: body.timestamp,
    }

    // Non-401 or no original request → reject directly
    if (status !== 401 || !originalRequest) return Promise.reject(apiError)

    // Don't try to refresh on auth endpoints — show the error to the user
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register')
    if (isAuthEndpoint) return Promise.reject(apiError)

    // Already retried once or the refresh itself failed → logout
    if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
      clearQueryCache()
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.replace('/login'), 100)
      }
      return Promise.reject(apiError)
    }

    originalRequest._retry = true

    // Refresh in flight → queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return api(originalRequest)
        })
        .catch((e) => Promise.reject(e))
    }

    isRefreshing = true
    const { refreshToken } = useAuthStore.getState()

    if (!refreshToken) {
      isRefreshing = false
      clearQueryCache()
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.replace('/login'), 100)
      }
      return Promise.reject(apiError)
    }

    try {
      // Backend: POST /api/auth/refresh?refreshToken=<token>
      const refreshResponse = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        null,
        { params: { refreshToken } }
      )
      const newAccess = refreshResponse.data.data.accessToken
      const newRefresh = refreshResponse.data.data.refreshToken

      useAuthStore.getState().updateTokens(newAccess, newRefresh)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
      }
      processQueue(null, newAccess)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearQueryCache()
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.replace('/login'), 100)
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
