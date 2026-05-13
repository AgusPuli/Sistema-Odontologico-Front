import type {
  AsaClassification,
  BloodType,
  FlossingFrequency,
} from '../types/medical-history.types'

/**
 * Centralized labels for the medical history enums. Single source of truth
 * for the Spanish display strings — used in the form selects, the legend, and
 * any future read-only summary card.
 */

export const ASA_LABEL: Record<AsaClassification, string> = {
  ASA_I: 'I — Paciente sano',
  ASA_II: 'II — Enfermedad sistémica leve',
  ASA_III: 'III — Enfermedad sistémica severa',
  ASA_IV: 'IV — Enfermedad que amenaza la vida',
  ASA_V: 'V — Paciente moribundo',
}

export const BLOOD_TYPE_LABEL: Record<BloodType, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
  UNKNOWN: 'Desconocido',
}

export const FLOSSING_LABEL: Record<FlossingFrequency, string> = {
  DAILY: 'Diario',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
  RARELY: 'Ocasional',
  NEVER: 'Nunca',
}
