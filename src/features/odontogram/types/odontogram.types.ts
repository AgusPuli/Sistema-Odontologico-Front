export type Dentition = 'PERMANENT' | 'PRIMARY' | 'MIXED'

export type ToothCondition =
  // Restorative / surgical
  | 'HEALTHY'
  | 'CARIES'
  | 'EXTRACTED'
  | 'RESTORATION'
  | 'ENDODONTICS'
  | 'IMPLANT'
  | 'CROWN'
  | 'MISSING'
  | 'PROSTHESIS'
  | 'FRACTURE'
  | 'SEALANT'
  | 'OBSERVATION'
  // Periodontal
  | 'GINGIVITIS'
  | 'CALCULUS'
  | 'GINGIVAL_RECESSION'
  | 'ABSCESS'
  // Anomalies / positioning
  | 'FUSION'
  | 'GEMINATION'
  | 'ROTATION'
  | 'MALPOSITION'
  | 'DIASTEMA'
  | 'IMPACTED'
  // Function / wear
  | 'MOBILITY'
  | 'BRUXISM'

export type ToothSurface = 'M' | 'D' | 'V' | 'L' | 'O' | 'I'

export type TreatmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface ToothSurfaceFinding {
  id: string
  surface: ToothSurface
  condition: ToothCondition
  notes: string | null
}

export interface ToothRecord {
  id: string
  fdiNumber: number
  condition: ToothCondition
  observation: string | null
  surfaces: ToothSurfaceFinding[]
}

export interface Odontogram {
  id: string
  tenantId: string
  patientId: string
  dentition: Dentition
  generalNotes: string | null
  current: boolean
  createdAt: string
  updatedAt: string | null
  teeth: ToothRecord[]
}

export interface CreateOdontogramRequest {
  patientId: string
  dentition: Dentition
  generalNotes?: string
}

export interface UpdateSurfaceRequest {
  surface: ToothSurface
  condition: ToothCondition
  notes?: string
}

export interface UpdateToothRequest {
  condition: ToothCondition
  observation?: string
  surfaces?: UpdateSurfaceRequest[]
  treatmentStatus?: TreatmentStatus
  historyNote?: string
  treatmentId?: string
}

export interface ToothHistoryEntry {
  id: string
  toothRecordId: string
  fdiNumber: number
  finding: ToothCondition
  surface: ToothSurface | null
  treatmentStatus: TreatmentStatus
  note: string | null
  recordedByEmail: string | null
  recordedAt: string
  treatmentId: string | null
  treatmentCode: string | null
  treatmentName: string | null
}
