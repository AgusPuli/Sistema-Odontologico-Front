import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'MANAGER'

export type DentalSpecialty =
  | 'GENERAL_DENTISTRY'
  | 'OPERATIVE_DENTISTRY'
  | 'ENDODONTICS'
  | 'PERIODONTICS'
  | 'ORAL_SURGERY'
  | 'ORTHODONTICS'
  | 'PEDIATRIC_DENTISTRY'
  | 'PROSTHODONTICS'
  | 'IMPLANTOLOGY'
  | 'AESTHETIC_DENTISTRY'
  | 'DIAGNOSTIC_IMAGING'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string | null
  role: UserRole
  tenantId: string
  specialty?: DentalSpecialty | null
  licenseNumber?: string | null
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean

  login: (token: string, refreshToken: string, user: AuthUser) => void
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
  updateTokens: (token: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      login: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      updateUser: (data) =>
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

      updateTokens: (token, refreshToken) => set({ token, refreshToken }),
    }),
    {
      name: 'odontograma-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
