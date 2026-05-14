import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api.types'
import {
  CreatePeriodontogramRequest,
  PeriodontogramData,
  UpdatePeriodontalToothRequest,
} from '../types/periodontogram.types'

/**
 * Backend: PeriodontogramController @ /api/periodontograms
 */
export const periodontogramApi = {
  /** Idempotent: returns existing current chart or seeds a fresh one. */
  getOrCreateCurrent: async (req: CreatePeriodontogramRequest) => {
    const r = await api.post<ApiResponse<PeriodontogramData>>(
      '/periodontograms/get-or-create-current',
      req,
    )
    return r.data
  },

  /** Force-create a new chart (archives current). */
  create: async (req: CreatePeriodontogramRequest) => {
    const r = await api.post<ApiResponse<PeriodontogramData>>('/periodontograms', req)
    return r.data
  },

  findById: async (id: string) => {
    const r = await api.get<ApiResponse<PeriodontogramData>>(`/periodontograms/${id}`)
    return r.data
  },

  findCurrentForPatient: async (patientId: string) => {
    const r = await api.get<ApiResponse<PeriodontogramData>>(
      `/periodontograms/patient/${patientId}/current`,
    )
    return r.data
  },

  findAllForPatient: async (patientId: string) => {
    const r = await api.get<ApiResponse<PeriodontogramData[]>>(
      `/periodontograms/patient/${patientId}`,
    )
    return r.data
  },

  /** Patch a single tooth + its site measurements. */
  updateTooth: async (
    periodontogramId: string,
    fdiNumber: number,
    req: UpdatePeriodontalToothRequest,
  ) => {
    const r = await api.put<ApiResponse<PeriodontogramData>>(
      `/periodontograms/${periodontogramId}/teeth/${fdiNumber}`,
      req,
    )
    return r.data
  },
}
