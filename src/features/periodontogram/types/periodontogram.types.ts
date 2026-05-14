export type PeriodontalSiteKey = 'MV' | 'V' | 'DV' | 'ML' | 'L' | 'DL'

export interface PeriodontalSiteData {
  id: string
  site: PeriodontalSiteKey
  probingDepth: number | null
  recession: number | null
  /** Computed by backend: probingDepth + recession */
  clinicalAttachmentLevel: number | null
  bleeding: boolean
  suppuration: boolean
  plaque: boolean
}

export interface PeriodontalToothData {
  id: string
  fdiNumber: number
  /** 0-3 (Miller scale) */
  mobility: number | null
  /** 0-3 (Hamp classification). Null if not a molar. */
  furcation: number | null
  notes: string | null
  sites: PeriodontalSiteData[]
}

export interface PeriodontogramData {
  id: string
  tenantId: string
  patientId: string
  examDate: string
  current: boolean
  generalNotes: string | null
  /** Percentage 0-100, 2 decimal places */
  bleedingIndex: number | null
  plaqueIndex: number | null
  teeth: PeriodontalToothData[]
  createdAt: string
  updatedAt: string
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreatePeriodontogramRequest {
  patientId: string
  examDate?: string | null
  generalNotes?: string | null
}

export interface PeriodontalSiteRequest {
  site: PeriodontalSiteKey
  probingDepth?: number | null
  recession?: number | null
  bleeding?: boolean | null
  suppuration?: boolean | null
  plaque?: boolean | null
}

export interface UpdatePeriodontalToothRequest {
  mobility?: number | null
  furcation?: number | null
  notes?: string | null
  sites?: PeriodontalSiteRequest[]
}
