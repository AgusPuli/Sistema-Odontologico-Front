import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { appointmentsApi } from '../api/appointments.api'
import { ApiError } from '@/types/api.types'
import {
  AppointmentStatus,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from '../types/appointment.types'

const KEYS = {
  all: ['appointments'] as const,
  byDate: (date: string) => ['appointments', 'date', date] as const,
  byPatient: (id: string) => ['appointments', 'patient', id] as const,
  detail: (id: string) => ['appointments', 'detail', id] as const,
}

export function useAppointmentsByDate(date: string) {
  return useQuery({
    queryKey: KEYS.byDate(date),
    queryFn: () => appointmentsApi.byDate(date),
    select: (r) => r.data,
  })
}

export function useAppointmentsByPatient(patientId: string | undefined) {
  return useQuery({
    queryKey: KEYS.byPatient(patientId || ''),
    queryFn: () => appointmentsApi.byPatient(patientId as string),
    enabled: !!patientId,
    select: (r) => r.data,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Turno creado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error al crear turno'),
  })
}

export function useUpdateAppointment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateAppointmentRequest) => appointmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Turno actualizado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error'),
  })
}

export function useChangeAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentsApi.changeStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo cambiar el estado'),
  })
}

export function useRescheduleAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; appointmentDate: string; appointmentTime: string }) =>
      appointmentsApi.reschedule(vars.id, vars.appointmentDate, vars.appointmentTime),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Turno reagendado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'Error'),
  })
}
