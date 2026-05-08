import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { ApiError, ErrorCode } from '@/types/api.types'
import {
  BootstrapRequest,
  ChangePasswordRequest,
  LoginRequest,
} from '../types/auth.types'

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

/**
 * Bootstrap (first-run setup): creates the first tenant + SUPERADMIN and
 * logs the user in immediately. Server returns 409 (BUSINESS_RULE_VIOLATION)
 * when the install already has any tenant — that's how we know to redirect
 * to /login instead.
 */
export function useBootstrap() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  return useMutation({
    mutationFn: (data: BootstrapRequest) => authApi.bootstrap(data),
    onSuccess: (response) => {
      const auth = response?.data
      if (!auth?.accessToken || !auth?.refreshToken || !auth?.user) {
        toast.error('Respuesta inválida del servidor')
        return
      }
      login(auth.accessToken, auth.refreshToken, auth.user)
      toast.success('Clínica inicializada')
      router.push('/dashboard')
    },
    onError: (error: ApiError) => {
      if (error.errorCode === ErrorCode.BUSINESS_RULE_VIOLATION) {
        toast.error('El sistema ya está inicializado. Iniciá sesión normalmente.')
        router.push('/login')
        return
      }
      toast.error(error.message || 'No se pudo inicializar el sistema')
    },
  })
}
