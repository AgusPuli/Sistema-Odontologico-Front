import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { clinicalSessionApi } from '../api/clinical-session.api'
import { ApiError } from '@/types/api.types'
import {
  CreateClinicalSessionRequest,
  UpdateClinicalSessionRequest,
} from '../types/clinical-session.types'

const KEYS = {
  all: ['clinical-sessions'] as const,
  byPatient: (patientId: string) => ['clinical-sessions', 'patient', patientId] as const,
  detail: (id: string) => ['clinical-sessions', 'detail', id] as const,
}

export function useClinicalSessionsByPatient(patientId: string | undefined) {
  return useQuery({
    queryKey: KEYS.byPatient(patientId || ''),
    queryFn: () => clinicalSessionApi.byPatient(patientId as string),
    enabled: !!patientId,
    select: (r) => r.data,
  })
}

export function useClinicalSession(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id || ''),
    queryFn: () => clinicalSessionApi.getById(id as string),
    enabled: !!id,
    select: (r) => r.data,
  })
}

export function useCreateClinicalSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateClinicalSessionRequest) => clinicalSessionApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Sesión clínica creada')
    },
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo crear la sesión'),
  })
}

export function useUpdateClinicalSession(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateClinicalSessionRequest) => clinicalSessionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success('Sesión actualizada')
    },
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo actualizar la sesión'),
  })
}

export function useDeleteClinicalSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clinicalSessionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Sesión eliminada')
    },
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo eliminar la sesión'),
  })
}
