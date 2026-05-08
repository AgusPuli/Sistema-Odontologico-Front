import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { patientsApi } from '../api/patients.api'
import { ApiError } from '@/types/api.types'
import { CreatePatientRequest, UpdatePatientRequest } from '../types/patient.types'

const KEYS = {
  all: ['patients'] as const,
  list: (search: string, page: number) => ['patients', 'list', search, page] as const,
  detail: (id: string) => ['patients', 'detail', id] as const,
}

export function usePatientsList(params: { search?: string; page?: number; size?: number }) {
  const search = params.search ?? ''
  const page = params.page ?? 0
  return useQuery({
    queryKey: KEYS.list(search, page),
    queryFn: () => patientsApi.list({ search, page, size: params.size ?? 20, sort: 'lastName' }),
    select: (r) => r.data,
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id || ''),
    queryFn: () => patientsApi.getById(id as string),
    enabled: !!id,
    select: (r) => r.data,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Paciente creado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error al crear paciente'),
  })
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePatientRequest) => patientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success('Paciente actualizado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error al actualizar'),
  })
}

export function useDeactivatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patientsApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Paciente desactivado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error'),
  })
}

export function useActivatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patientsApi.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Paciente activado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error'),
  })
}
