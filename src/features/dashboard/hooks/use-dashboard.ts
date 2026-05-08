import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    select: (r) => r.data,
    staleTime: 60_000, // 1 min — KPIs don't need to be fresh-fresh
  })
}
