import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api.types'
import { Tenant, UpdateTenantRequest } from '../types/tenant.types'

export const tenantApi = {
  /** GET /api/tenants/me — current user's tenant */
  me: async () => {
    const r = await api.get<ApiResponse<Tenant>>('/tenants/me')
    return r.data
  },

  getById: async (id: string) => {
    const r = await api.get<ApiResponse<Tenant>>(`/tenants/${id}`)
    return r.data
  },

  update: async (id: string, data: UpdateTenantRequest) => {
    const r = await api.put<ApiResponse<Tenant>>(`/tenants/${id}`, data)
    return r.data
  },
}
