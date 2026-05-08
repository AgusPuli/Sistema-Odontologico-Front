import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { treatmentsApi } from '../api/treatments.api'
import { ApiError } from '@/types/api.types'
import type { DentalSpecialty } from '@/stores/auth.store'
import {
  CreateTreatmentRequest,
  UpdateTreatmentRequest,
} from '../types/treatment.types'

const KEYS = {
  all: ['treatments'] as const,
  search: (specialty: string, q: string, page: number) =>
    ['treatments', 'search', specialty, q, page] as const,
  bySpecialty: (specialty: DentalSpecialty) => ['treatments', 'specialty', specialty] as const,
  detail: (id: string) => ['treatments', 'detail', id] as const,
}

export function useTreatmentsSearch(params: {
  specialty?: DentalSpecialty
  search?: string
  page?: number
  size?: number
}) {
  const search = params.search ?? ''
  const page = params.page ?? 0
  return useQuery({
    queryKey: KEYS.search(params.specialty ?? '', search, page),
    queryFn: () =>
      treatmentsApi.search({
        specialty: params.specialty,
        search,
        page,
        size: params.size ?? 50,
        sort: 'specialty,name',
      }),
    select: (r) => r.data,
  })
}

export function useTreatmentsBySpecialty(specialty: DentalSpecialty | undefined) {
  return useQuery({
    queryKey: KEYS.bySpecialty(specialty as DentalSpecialty),
    queryFn: () => treatmentsApi.bySpecialty(specialty as DentalSpecialty),
    enabled: !!specialty,
    select: (r) => r.data,
  })
}

export function useCreateTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTreatmentRequest) => treatmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Tratamiento creado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error al crear tratamiento'),
  })
}

export function useUpdateTreatment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTreatmentRequest) => treatmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Tratamiento actualizado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error'),
  })
}

export function useDeactivateTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => treatmentsApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useActivateTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => treatmentsApi.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useSeedDefaultTreatments() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => treatmentsApi.seedDefaults(),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(`Catálogo cargado: ${r.data.created} tratamientos creados`)
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error al cargar catálogo'),
  })
}
