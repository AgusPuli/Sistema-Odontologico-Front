import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api.types'
import { MedicalHistory, MedicalHistoryRequest } from '../types/medical-history.types'

/**
 * Backend: MedicalHistoryController mounted under /api/patients/{patientId}/medical-history.
 */
export const medicalHistoryApi = {
  byPatient: async (patientId: string) => {
    const r = await api.get<ApiResponse<MedicalHistory>>(`/patients/${patientId}/medical-history`)
    return r.data
  },

  upsert: async (patientId: string, data: MedicalHistoryRequest) => {
    const r = await api.put<ApiResponse<MedicalHistory>>(
      `/patients/${patientId}/medical-history`,
      data,
    )
    return r.data
  },
}
