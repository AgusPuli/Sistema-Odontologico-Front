import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { estimatesApi } from '../api/estimates.api'
import { ApiError } from '@/types/api.types'
import { CreateEstimateRequest, EstimateStatus } from '../types/estimate.types'

const KEYS = {
  all: ['estimates'] as const,
  list: (page: number) => ['estimates', 'list', page] as const,
  detail: (id: string) => ['estimates', 'detail', id] as const,
  byPatient: (patientId: string) => ['estimates', 'patient', patientId] as const,
}

export function useEstimatesList(page = 0) {
  return useQuery({
    queryKey: KEYS.list(page),
    queryFn: () => estimatesApi.list({ page, size: 20, sort: 'issueDate,desc' }),
    select: (r) => r.data,
  })
}

export function useEstimate(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id || ''),
    queryFn: () => estimatesApi.getById(id as string),
    enabled: !!id,
    select: (r) => r.data,
  })
}

export function useEstimatesByPatient(patientId: string | undefined) {
  return useQuery({
    queryKey: KEYS.byPatient(patientId || ''),
    queryFn: () => estimatesApi.byPatient(patientId as string),
    enabled: !!patientId,
    select: (r) => r.data,
  })
}

export function useCreateEstimate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEstimateRequest) => estimatesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Presupuesto creado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error al crear presupuesto'),
  })
}

export function useChangeEstimateStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EstimateStatus }) =>
      estimatesApi.changeStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Estado actualizado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error'),
  })
}

export function useUpdateEstimate(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEstimateRequest) => estimatesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success('Presupuesto actualizado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error al actualizar'),
  })
}

export function useDeleteEstimate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => estimatesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Presupuesto eliminado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo eliminar'),
  })
}
