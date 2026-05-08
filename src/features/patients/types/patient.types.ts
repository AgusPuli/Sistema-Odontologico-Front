export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

/**
 * Mirror of backend PatientResponse.java.
 */
export interface Patient {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  fullName: string
  documentNumber: string | null
  birthDate: string | null
  gender: Gender | null
  phone: string | null
  email: string | null
  address: string | null
  healthInsurance: string | null
  insuranceNumber: string | null
  medicalNotes: string | null
  allergies: string | null
  active: boolean
  createdAt: string
}

export interface CreatePatientRequest {
  firstName: string
  lastName: string
  documentNumber?: string
  birthDate?: string
  gender?: Gender
  phone?: string
  email?: string
  address?: string
  healthInsurance?: string
  insuranceNumber?: string
  medicalNotes?: string
  allergies?: string
}

export type UpdatePatientRequest = CreatePatientRequest
