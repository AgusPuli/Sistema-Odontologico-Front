import type { PeriodontalSiteKey } from '../types/periodontogram.types'

/** Display order and labels for the 6 periodontal sites. */
export const SITE_META: Record<PeriodontalSiteKey, { label: string; shortLabel: string }> = {
  MV: { label: 'Mesiovestibular', shortLabel: 'MV' },
  V:  { label: 'Vestibular',      shortLabel: 'V'  },
  DV: { label: 'Distovestibular', shortLabel: 'DV' },
  ML: { label: 'Mesiolingual',    shortLabel: 'ML' },
  L:  { label: 'Lingual',         shortLabel: 'L'  },
  DL: { label: 'Distolingual',    shortLabel: 'DL' },
}

/** Canonical display order — vestibular row then lingual row */
export const SITE_ORDER: PeriodontalSiteKey[] = ['MV', 'V', 'DV', 'ML', 'L', 'DL']

/** FDI numbers that have furcation readings (molars). */
export const MOLAR_FDI = new Set([16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48])

/** Upper-arch FDI numbers (for UI layout — rendered top row). */
export const UPPER_FDI = new Set([
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
])

/**
 * Returns a Tailwind colour class for a probing depth value.
 * ≤3 mm → green, 4-5 mm → yellow, ≥6 mm → red.
 */
export function pdColour(pd: number | null): string {
  if (pd === null) return 'text-muted-foreground'
  if (pd <= 3) return 'text-emerald-600'
  if (pd <= 5) return 'text-amber-500'
  return 'text-rose-600'
}

/** Miller mobility scale labels (0-3). */
export const MOBILITY_LABEL: Record<number, string> = {
  0: '0 – Sin movilidad',
  1: '1 – < 1 mm horizontal',
  2: '2 – > 1 mm horizontal',
  3: '3 – Movilidad vertical',
}

/** Hamp furcation classification labels (0-3). */
export const FURCATION_LABEL: Record<number, string> = {
  0: '0 – Sin afectación',
  1: 'I – < 3 mm horizontal',
  2: 'II – > 3 mm sin pasante',
  3: 'III – Pasante completo',
}
