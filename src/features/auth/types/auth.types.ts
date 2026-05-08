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

/**
 * Bootstrap (first-run setup): creates the first tenant + SUPERADMIN. Backend
 * rejects the request with 409 if any tenant already exists.
 */
export interface BootstrapRequest {
  clinicName: string
  adminEmail: string
  adminPassword: string
  adminFirstName: string
  adminLastName?: string
}
