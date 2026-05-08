import { api } from '@/lib/api'
import { ApiResponse, Page } from '@/types/api.types'
import type { DentalSpecialty } from '@/stores/auth.store'
import {
  CreateTreatmentRequest,
  Treatment,
  UpdateTreatmentRequest,
} from '../types/treatment.types'

/**
 * Backend: TreatmentController @ /api/treatments.
 */
export const treatmentsApi = {
  search: async (params: {
    specialty?: DentalSpecialty
    search?: string
    page?: number
    size?: number
    sort?: string
  }) => {
    const r = await api.get<ApiResponse<Page<Treatment>>>('/treatments', { params })
    return r.data
  },

  bySpecialty: async (specialty: DentalSpecialty) => {
    const r = await api.get<ApiResponse<Treatment[]>>(`/treatments/by-specialty/${specialty}`)
    return r.data
  },

  getById: async (id: string) => {
    const r = await api.get<ApiResponse<Treatment>>(`/treatments/${id}`)
    return r.data
  },

  create: async (data: CreateTreatmentRequest) => {
    const r = await api.post<ApiResponse<Treatment>>('/treatments', data)
    return r.data
  },

  update: async (id: string, data: UpdateTreatmentRequest) => {
    const r = await api.put<ApiResponse<Treatment>>(`/treatments/${id}`, data)
    return r.data
  },

  deactivate: async (id: string) => {
    const r = await api.patch<ApiResponse<void>>(`/treatments/${id}/deactivate`)
    return r.data
  },

  activate: async (id: string) => {
    const r = await api.patch<ApiResponse<void>>(`/treatments/${id}/activate`)
    return r.data
  },

  /**
   * POST /api/treatments/seed-defaults
   * Loads ~60 default dental treatments grouped by specialty into the current tenant.
   */
  seedDefaults: async () => {
    const r = await api.post<ApiResponse<{ created: number }>>('/treatments/seed-defaults')
    return r.data
  },
}
