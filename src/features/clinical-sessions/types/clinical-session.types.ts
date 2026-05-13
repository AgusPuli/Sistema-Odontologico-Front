export type ClinicalSessionStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED'

export interface SessionProcedure {
  id: string
  treatmentId: string
  treatmentCode: string
  treatmentName: string
  fdiNumber: number | null
  notes: string | null
}

/**
 * Mirror of backend ClinicalSessionResponse.
 */
export interface ClinicalSession {
  id: string
  tenantId: string
  patientId: string
  patientFullName: string | null
  dentistId: string
  dentistFullName: string | null
  appointmentId: string | null
  sessionDate: string
  durationMinutes: number | null

  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  heartRate: number | null

  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null

  anesthesiaUsed: boolean
  anesthesiaType: string | null
  anesthesiaDoses: number | null

  materialsUsed: string | null
  generalNotes: string | null
  nextAppointmentRecommendation: string | null

  status: ClinicalSessionStatus
  procedures: SessionProcedure[]

  createdAt: string | null
  updatedAt: string | null
  createdBy: string | null
}

export interface SessionProcedureRequest {
  treatmentId: string
  fdiNumber?: number | null
  notes?: string
}

export interface CreateClinicalSessionRequest {
  patientId: string
  dentistId?: string
  appointmentId?: string
  sessionDate?: string
  durationMinutes?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  anesthesiaUsed?: boolean
  anesthesiaType?: string
  anesthesiaDoses?: number
  materialsUsed?: string
  generalNotes?: string
  nextAppointmentRecommendation?: string
  status?: ClinicalSessionStatus
  procedures?: SessionProcedureRequest[]
}

export type UpdateClinicalSessionRequest = Omit<CreateClinicalSessionRequest, 'patientId'>
