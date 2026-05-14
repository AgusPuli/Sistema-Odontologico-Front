import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { periodontogramApi } from '../api/periodontogram.api'
import { ApiError } from '@/types/api.types'
import {
  CreatePeriodontogramRequest,
  UpdatePeriodontalToothRequest,
} from '../types/periodontogram.types'

// ── Query keys ────────────────────────────────────────────────────────────────

export const PERIO_KEYS = {
  all: ['periodontograms'] as const,
  byPatient: (patientId: string) => ['periodontograms', 'patient', patientId] as const,
  currentForPatient: (patientId: string) =>
    ['periodontograms', 'patient', patientId, 'current'] as const,
  byId: (id: string) => ['periodontograms', id] as const,
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useCurrentPeriodontogram(patientId: string | undefined) {
  return useQuery({
    queryKey: PERIO_KEYS.currentForPatient(patientId ?? ''),
    queryFn: () => periodontogramApi.findCurrentForPatient(patientId as string),
    enabled: !!patientId,
    select: (r) => r.data,
    retry: (failureCount, error: ApiError) => {
      // Don't retry on 404 — it just means no chart exists yet
      if (error?.status === 404) return false
      return failureCount < 2
    },
  })
}

export function usePeriodontogramHistory(patientId: string | undefined) {
  return useQuery({
    queryKey: PERIO_KEYS.byPatient(patientId ?? ''),
    queryFn: () => periodontogramApi.findAllForPatient(patientId as string),
    enabled: !!patientId,
    select: (r) => r.data,
  })
}

export function usePeriodontogramById(id: string | undefined) {
  return useQuery({
    queryKey: PERIO_KEYS.byId(id ?? ''),
    queryFn: () => periodontogramApi.findById(id as string),
    enabled: !!id,
    select: (r) => r.data,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useGetOrCreatePeriodontogram(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreatePeriodontogramRequest) => periodontogramApi.getOrCreateCurrent(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PERIO_KEYS.currentForPatient(patientId) })
    },
    onError: (e: ApiError) =>
      toast.error(e.message || 'No se pudo cargar el periodontograma'),
  })
}

export function useCreatePeriodontogram(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreatePeriodontogramRequest) => periodontogramApi.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PERIO_KEYS.byPatient(patientId) })
      qc.invalidateQueries({ queryKey: PERIO_KEYS.currentForPatient(patientId) })
      toast.success('Nuevo periodontograma iniciado')
    },
    onError: (e: ApiError) =>
      toast.error(e.message || 'No se pudo crear el periodontograma'),
  })
}

export function useUpdatePeriodontalTooth(periodontogramId: string, patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      fdiNumber,
      req,
    }: {
      fdiNumber: number
      req: UpdatePeriodontalToothRequest
    }) => periodontogramApi.updateTooth(periodontogramId, fdiNumber, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PERIO_KEYS.byId(periodontogramId) })
      qc.invalidateQueries({ queryKey: PERIO_KEYS.currentForPatient(patientId) })
    },
    onError: (e: ApiError) =>
      toast.error(e.message || 'No se pudo guardar el diente'),
  })
}
