import { api } from '@/lib/api'
import { ApiResponse, Page } from '@/types/api.types'
import { CreatePatientRequest, Patient, UpdatePatientRequest } from '../types/patient.types'

/**
 * Backend: PatientController @ /api/patients.
 */
export const patientsApi = {
  list: async (params: { search?: string; page?: number; size?: number; sort?: string }) => {
    const r = await api.get<ApiResponse<Page<Patient>>>('/patients', { params })
    return r.data
  },

  getById: async (id: string) => {
    const r = await api.get<ApiResponse<Patient>>(`/patients/${id}`)
    return r.data
  },

  create: async (data: CreatePatientRequest) => {
    const r = await api.post<ApiResponse<Patient>>('/patients', data)
    return r.data
  },

  update: async (id: string, data: UpdatePatientRequest) => {
    const r = await api.put<ApiResponse<Patient>>(`/patients/${id}`, data)
    return r.data
  },

  deactivate: async (id: string) => {
    const r = await api.patch<ApiResponse<void>>(`/patients/${id}/deactivate`)
    return r.data
  },

  activate: async (id: string) => {
    const r = await api.patch<ApiResponse<void>>(`/patients/${id}/activate`)
    return r.data
  },
}
