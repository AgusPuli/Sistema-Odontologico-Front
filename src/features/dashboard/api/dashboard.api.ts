import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api.types'
import { DashboardStats } from '../types/dashboard.types'

export const dashboardApi = {
  /** GET /api/dashboard/stats — KPIs for the current tenant */
  getStats: async () => {
    const r = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return r.data
  },
}
