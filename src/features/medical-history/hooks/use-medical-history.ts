import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { medicalHistoryApi } from '../api/medical-history.api'
import { ApiError } from '@/types/api.types'
import { MedicalHistoryRequest } from '../types/medical-history.types'

const KEYS = {
  byPatient: (patientId: string) => ['medical-history', patientId] as const,
}

export function useMedicalHistory(patientId: string | undefined) {
  return useQuery({
    queryKey: KEYS.byPatient(patientId || ''),
    queryFn: () => medicalHistoryApi.byPatient(patientId as string),
    enabled: !!patientId,
    select: (r) => r.data,
  })
}

export function useUpsertMedicalHistory(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MedicalHistoryRequest) => medicalHistoryApi.upsert(patientId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.byPatient(patientId) })
      toast.success('Historia clínica guardada')
    },
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo guardar la historia clínica'),
  })
}
