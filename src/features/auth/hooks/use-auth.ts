import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { ApiError, ErrorCode } from '@/types/api.types'
import { ChangePasswordRequest, LoginRequest } from '../types/auth.types'

/**
 * Login: POST /auth/login -> persist tokens + user, redirect to /dashboard.
 */
export function useLogin() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (response) => {
      const auth = response?.data
      if (!auth?.accessToken || !auth?.refreshToken || !auth?.user) {
        toast.error('Respuesta inválida del servidor')
        return
      }
      login(auth.accessToken, auth.refreshToken, auth.user)
      toast.success('Sesión iniciada')
      router.push('/dashboard')
    },
    onError: (error: ApiError) => {
      const messages: Record<string, string> = {
        [ErrorCode.INVALID_CREDENTIALS]: 'Email o contraseña incorrectos.',
        [ErrorCode.NETWORK_ERROR]: 'No se pudo conectar con el servidor.',
        [ErrorCode.VALIDATION_ERROR]: 'Verificá los campos del formulario.',
      }
      toast.error(messages[error.errorCode] || error.message || 'Error al iniciar sesión')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout()
      router.push('/login')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => toast.success('Contraseña actualizada'),
    onError: (error: ApiError) =>
      toast.error(error.message || 'No se pudo cambiar la contraseña'),
  })
}

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return { user, token, isAuthenticated }
}
