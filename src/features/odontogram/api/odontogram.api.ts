import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api.types'
import {
  CreateOdontogramRequest,
  Odontogram,
  ToothHistoryEntry,
  TreatmentStatus,
  UpdateToothRequest,
} from '../types/odontogram.types'

/**
 * Backend: OdontogramController @ /api/odontograms.
 */
export const odontogramApi = {
  create: async (data: CreateOdontogramRequest) => {
    const r = await api.post<ApiResponse<Odontogram>>('/odontograms', data)
    return r.data
  },

  /**
   * Idempotent variant: returns the patient's current odontogram if one exists,
   * otherwise creates a new one. Safe to call on every chart load.
   */
  getOrCreateCurrent: async (data: CreateOdontogramRequest) => {
    const r = await api.post<ApiResponse<Odontogram>>('/odontograms/get-or-create-current', data)
    return r.data
  },

  getById: async (id: string) => {
    const r = await api.get<ApiResponse<Odontogram>>(`/odontograms/${id}`)
    return r.data
  },

  getCurrentByPatient: async (patientId: string) => {
    const r = await api.get<ApiResponse<Odontogram>>(`/odontograms/patient/${patientId}/current`)
    return r.data
  },

  listByPatient: async (patientId: string) => {
    const r = await api.get<ApiResponse<Odontogram[]>>(`/odontograms/patient/${patientId}`)
    return r.data
  },

  updateTooth: async (odontogramId: string, fdiNumber: number, data: UpdateToothRequest) => {
    const r = await api.put<ApiResponse<Odontogram>>(
      `/odontograms/${odontogramId}/teeth/${fdiNumber}`,
      data
    )
    return r.data
  },

  toothHistory: async (odontogramId: string, fdiNumber: number) => {
    const r = await api.get<ApiResponse<ToothHistoryEntry[]>>(
      `/odontograms/${odontogramId}/teeth/${fdiNumber}/history`
    )
    return r.data
  },

  treatmentPlan: async (odontogramId: string, status?: TreatmentStatus) => {
    const r = await api.get<ApiResponse<ToothHistoryEntry[]>>(
      `/odontograms/${odontogramId}/treatment-plan`,
      { params: status ? { status } : undefined }
    )
    return r.data
  },
}
