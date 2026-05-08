import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { odontogramApi } from '../api/odontogram.api'
import { ApiError } from '@/types/api.types'
import {
  CreateOdontogramRequest,
  TreatmentStatus,
  UpdateToothRequest,
} from '../types/odontogram.types'

const KEYS = {
  detail: (id: string) => ['odontogram', 'detail', id] as const,
  current: (patientId: string) => ['odontogram', 'current', patientId] as const,
  byPatient: (patientId: string) => ['odontogram', 'patient', patientId] as const,
  toothHistory: (id: string, fdi: number) => ['odontogram', id, 'tooth', fdi, 'history'] as const,
  plan: (id: string, status?: string) => ['odontogram', id, 'plan', status ?? 'all'] as const,
}

export function useCurrentOdontogram(patientId: string | undefined) {
  return useQuery({
    queryKey: KEYS.current(patientId || ''),
    queryFn: () => odontogramApi.getCurrentByPatient(patientId as string),
    enabled: !!patientId,
    select: (r) => r.data,
    retry: false,
  })
}

export function useOdontogramHistoryList(patientId: string | undefined) {
  return useQuery({
    queryKey: KEYS.byPatient(patientId || ''),
    queryFn: () => odontogramApi.listByPatient(patientId as string),
    enabled: !!patientId,
    select: (r) => r.data,
  })
}

export function useOdontogram(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id || ''),
    queryFn: () => odontogramApi.getById(id as string),
    enabled: !!id,
    select: (r) => r.data,
  })
}

export function useToothHistory(odontogramId: string | undefined, fdiNumber: number | null) {
  return useQuery({
    queryKey: KEYS.toothHistory(odontogramId || '', fdiNumber ?? -1),
    queryFn: () => odontogramApi.toothHistory(odontogramId as string, fdiNumber as number),
    enabled: !!odontogramId && fdiNumber != null,
    select: (r) => r.data,
  })
}

export function useTreatmentPlan(odontogramId: string | undefined, status?: TreatmentStatus) {
  return useQuery({
    queryKey: KEYS.plan(odontogramId || '', status),
    queryFn: () => odontogramApi.treatmentPlan(odontogramId as string, status),
    enabled: !!odontogramId,
    select: (r) => r.data,
  })
}

export function useCreateOdontogram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOdontogramRequest) => odontogramApi.create(data),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['odontogram'] })
      toast.success('Odontograma creado')
      return r
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error al crear odontograma'),
  })
}

/**
 * Idempotent: opens the patient's existing chart or creates one. Use this when
 * you don't want to risk archiving an existing odontogram by mistake.
 */
export function useGetOrCreateOdontogram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOdontogramRequest) => odontogramApi.getOrCreateCurrent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['odontogram'] }),
    onError: (e: ApiError) => toast.error(e.message || 'Error al abrir el odontograma'),
  })
}

export function useUpdateTooth(odontogramId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { fdiNumber: number; data: UpdateToothRequest }) =>
      odontogramApi.updateTooth(odontogramId, vars.fdiNumber, vars.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(odontogramId) })
      qc.invalidateQueries({ queryKey: ['odontogram'] })
      qc.invalidateQueries({ queryKey: KEYS.toothHistory(odontogramId, vars.fdiNumber) })
      qc.invalidateQueries({ queryKey: ['odontogram', odontogramId, 'plan'] })
      toast.success('Pieza dental actualizada')
    },
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo actualizar la pieza'),
  })
}
