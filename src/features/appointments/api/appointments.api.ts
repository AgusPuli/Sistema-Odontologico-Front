import { api } from '@/lib/api'
import { ApiResponse, Page } from '@/types/api.types'
import {
  Appointment,
  AppointmentStatus,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from '../types/appointment.types'

export const appointmentsApi = {
  list: async (params: { page?: number; size?: number; sort?: string }) => {
    const r = await api.get<ApiResponse<Page<Appointment>>>('/appointments', { params })
    return r.data
  },

  byDate: async (date: string) => {
    const r = await api.get<ApiResponse<Appointment[]>>('/appointments/by-date', {
      params: { date },
    })
    return r.data
  },

  byRange: async (from: string, to: string) => {
    const r = await api.get<ApiResponse<Appointment[]>>('/appointments/by-range', {
      params: { from, to },
    })
    return r.data
  },

  byPatient: async (patientId: string) => {
    const r = await api.get<ApiResponse<Appointment[]>>(`/appointments/by-patient/${patientId}`)
    return r.data
  },

  getById: async (id: string) => {
    const r = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`)
    return r.data
  },

  create: async (data: CreateAppointmentRequest) => {
    const r = await api.post<ApiResponse<Appointment>>('/appointments', data)
    return r.data
  },

  update: async (id: string, data: UpdateAppointmentRequest) => {
    const r = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, data)
    return r.data
  },

  changeStatus: async (id: string, status: AppointmentStatus) => {
    const r = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status })
    return r.data
  },

  reschedule: async (id: string, appointmentDate: string, appointmentTime: string) => {
    const r = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, {
      appointmentDate,
      appointmentTime,
    })
    return r.data
  },
}
