import { api } from '@/lib/api'
import { ApiResponse, Page } from '@/types/api.types'
import { CreateEstimateRequest, Estimate, EstimateStatus } from '../types/estimate.types'

export const estimatesApi = {
  list: async (params: { page?: number; size?: number; sort?: string }) => {
    const r = await api.get<ApiResponse<Page<Estimate>>>('/estimates', { params })
    return r.data
  },

  getById: async (id: string) => {
    const r = await api.get<ApiResponse<Estimate>>(`/estimates/${id}`)
    return r.data
  },

  byPatient: async (patientId: string) => {
    const r = await api.get<ApiResponse<Estimate[]>>(`/estimates/by-patient/${patientId}`)
    return r.data
  },

  create: async (data: CreateEstimateRequest) => {
    const r = await api.post<ApiResponse<Estimate>>('/estimates', data)
    return r.data
  },

  update: async (id: string, data: CreateEstimateRequest) => {
    const r = await api.put<ApiResponse<Estimate>>(`/estimates/${id}`, data)
    return r.data
  },

  changeStatus: async (id: string, status: EstimateStatus) => {
    const r = await api.patch<ApiResponse<Estimate>>(`/estimates/${id}/status`, null, {
      params: { status },
    })
    return r.data
  },

  delete: async (id: string) => {
    const r = await api.delete<ApiResponse<void>>(`/estimates/${id}`)
    return r.data
  },
}
