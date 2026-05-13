export type AsaClassification = 'ASA_I' | 'ASA_II' | 'ASA_III' | 'ASA_IV' | 'ASA_V'

export type BloodType =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'
  | 'UNKNOWN'

export type FlossingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'RARELY' | 'NEVER'

/**
 * Mirror of backend MedicalHistoryResponse.
 * Every field is optional because the backend returns a "stub" (mostly null
 * booleans) when the patient has no record yet.
 */
export interface MedicalHistory {
  id: string | null
  tenantId: string
  patientId: string

  asaClassification: AsaClassification | null
  bloodType: BloodType | null

  diabetes: boolean
  diabetesNotes: string | null
  hypertension: boolean
  hypertensionNotes: string | null
  heartDisease: boolean
  heartDiseaseNotes: string | null
  kidneyDisease: boolean
  liverDisease: boolean
  respiratoryDisease: boolean
  thyroidDisease: boolean
  cancer: boolean
  bleedingDisorder: boolean
  anticoagulantUse: boolean
  epilepsy: boolean
  psychiatricCondition: boolean
  otherConditions: string | null

  allergyPenicillin: boolean
  allergyLatex: boolean
  allergyAnesthesia: boolean
  allergyOther: string | null

  currentMedications: string | null

  smoker: boolean
  smokingDetails: string | null
  alcohol: boolean
  alcoholDetails: string | null
  bruxism: boolean

  pregnant: boolean
  pregnancyWeeks: number | null
  breastfeeding: boolean

  chiefComplaint: string | null
  lastDentalVisit: string | null
  previousDentalProblems: string | null
  brushingPerDay: number | null
  flossingFrequency: FlossingFrequency | null

  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  heartRate: number | null

  generalObservations: string | null
  lastReviewedAt: string | null
  createdAt: string | null
  updatedAt: string | null
  updatedBy: string | null
}

/**
 * Upsert payload — every field optional, the backend patches non-null values.
 * For the UI it's simpler to send the whole form on save.
 */
export interface MedicalHistoryRequest extends Partial<Omit<MedicalHistory,
  'id' | 'tenantId' | 'patientId' | 'lastReviewedAt' | 'createdAt' | 'updatedAt' | 'updatedBy'
>> {}
