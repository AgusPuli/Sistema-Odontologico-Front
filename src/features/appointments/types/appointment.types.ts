export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED'

export interface Appointment {
  id: string
  tenantId: string
  patientId: string
  patientFullName: string | null
  dentistId: string | null
  dentistFullName: string | null
  appointmentDate: string
  appointmentTime: string
  durationMinutes: number
  reason: string | null
  notes: string | null
  status: AppointmentStatus
  createdAt: string
}

export interface CreateAppointmentRequest {
  patientId: string
  dentistId?: string
  appointmentDate: string
  appointmentTime: string
  durationMinutes?: number
  reason?: string
  notes?: string
}

export type UpdateAppointmentRequest = Partial<Omit<CreateAppointmentRequest, 'patientId'>>
