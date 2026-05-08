import { useQuery } from '@tanstack/react-query'
import { tenantApi } from '../api/tenant.api'

export function useCurrentTenant() {
  return useQuery({
    queryKey: ['tenant', 'me'],
    queryFn: () => tenantApi.me(),
    select: (r) => r.data,
  })
}
