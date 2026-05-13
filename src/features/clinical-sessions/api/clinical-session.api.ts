import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api.types'
import {
  ClinicalSession,
  CreateClinicalSessionRequest,
  UpdateClinicalSessionRequest,
} from '../types/clinical-session.types'

/**
 * Backend: ClinicalSessionController @ /api/clinical-sessions.
 */
export const clinicalSessionApi = {
  create: async (data: CreateClinicalSessionRequest) => {
    const r = await api.post<ApiResponse<ClinicalSession>>('/clinical-sessions', data)
    return r.data
  },

  getById: async (id: string) => {
    const r = await api.get<ApiResponse<ClinicalSession>>(`/clinical-sessions/${id}`)
    return r.data
  },

  byPatient: async (patientId: string) => {
    const r = await api.get<ApiResponse<ClinicalSession[]>>(
      `/clinical-sessions/patient/${patientId}`,
    )
    return r.data
  },

  update: async (id: string, data: UpdateClinicalSessionRequest) => {
    const r = await api.put<ApiResponse<ClinicalSession>>(`/clinical-sessions/${id}`, data)
    return r.data
  },

  delete: async (id: string) => {
    const r = await api.delete<ApiResponse<void>>(`/clinical-sessions/${id}`)
    return r.data
  },
}
