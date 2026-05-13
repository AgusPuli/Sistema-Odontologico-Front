/**
 * Display labels for backend enums. Centralized so every screen renders
 * the same Spanish copy without re-importing the lists everywhere.
 */
import type { DentalSpecialty } from '@/stores/auth.store'

export const DENTAL_SPECIALTY_LABEL: Record<DentalSpecialty, string> = {
  GENERAL_DENTISTRY: 'Odontología General',
  OPERATIVE_DENTISTRY: 'Operatoria Dental',
  ENDODONTICS: 'Endodoncia',
  PERIODONTICS: 'Periodoncia',
  ORAL_SURGERY: 'Cirugía Oral y Maxilofacial',
  ORTHODONTICS: 'Ortodoncia',
  PEDIATRIC_DENTISTRY: 'Odontopediatría',
  PROSTHODONTICS: 'Prótesis y Rehabilitación Oral',
  IMPLANTOLOGY: 'Implantología',
  AESTHETIC_DENTISTRY: 'Estética Dental',
  DIAGNOSTIC_IMAGING: 'Diagnóstico por Imágenes',
}

export const DENTAL_SPECIALTIES = Object.keys(DENTAL_SPECIALTY_LABEL) as DentalSpecialty[]

/**
 * @deprecated Import `labelOf` from `@/features/odontogram/config/conditions` instead.
 * Kept as a re-export so legacy imports keep working — the real data lives in that file.
 */
export { TOOTH_CONDITION_LABEL } from '@/features/odontogram/config/condition-labels-compat'

export const TREATMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Realizado',
  CANCELLED: 'Cancelado',
}

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CHECKED_IN: 'Atendiendo',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'No asistió',
  RESCHEDULED: 'Reagendado',
}

export const ESTIMATE_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviado',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
}

export const GENDER_LABEL: Record<string, string> = {
  MALE: 'Masculino',
  FEMALE: 'Femenino',
  OTHER: 'Otro',
}
