import type { DentalSpecialty } from '@/stores/auth.store'

export interface Treatment {
  id: string
  tenantId: string
  code: string
  name: string
  specialty: DentalSpecialty
  specialtyDisplay: string | null
  defaultPrice: number | null
  durationMinutes: number | null
  description: string | null
  active: boolean
}

export interface CreateTreatmentRequest {
  code: string
  name: string
  specialty: DentalSpecialty
  defaultPrice?: number
  durationMinutes?: number
  description?: string
}

export type UpdateTreatmentRequest = Partial<Omit<CreateTreatmentRequest, 'code'>>
