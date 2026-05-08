import type { AuthUser } from '@/stores/auth.store'

export interface LoginRequest {
  email: string
  password: string
}

/**
 * Backend (com.bs.odontograma.auth.dto.AuthResponse) returns this exact shape
 * inside ApiResponse.data.
 */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
