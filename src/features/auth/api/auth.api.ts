import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api.types'
import { AuthResponse, ChangePasswordRequest, LoginRequest } from '../types/auth.types'

/**
 * Auth endpoints (backend AuthController @ /api/auth/*).
 */
export const authApi = {
  /** POST /api/auth/login */
  login: async (data: LoginRequest) => {
    const r = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return r.data
  },

  /** POST /api/auth/refresh?refreshToken=... */
  refresh: async (refreshToken: string) => {
    const r = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', null, {
      params: { refreshToken },
    })
    return r.data
  },

  /** POST /api/auth/logout */
  logout: async () => {
    await api.post('/auth/logout')
  },

  /** POST /api/auth/change-password */
  changePassword: async (data: ChangePasswordRequest) => {
    const r = await api.post<ApiResponse<void>>('/auth/change-password', data)
    return r.data
  },
}
