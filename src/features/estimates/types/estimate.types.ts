export type EstimateStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'

export interface EstimateItem {
  id: string
  treatmentId: string
  treatmentCode: string
  treatmentName: string
  fdiNumber: number | null
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Estimate {
  id: string
  tenantId: string
  patientId: string
  patientFullName: string | null
  issueDate: string
  validUntil: string | null
  status: EstimateStatus
  total: number
  notes: string | null
  createdAt: string
  items: EstimateItem[]
}

export interface CreateEstimateRequest {
  patientId: string
  validUntil?: string
  notes?: string
  items: Array<{
    treatmentId: string
    fdiNumber?: number
    quantity?: number
    unitPrice?: number
  }>
}
