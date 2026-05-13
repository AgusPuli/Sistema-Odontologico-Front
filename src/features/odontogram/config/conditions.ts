/**
 * Single source of truth for every ToothCondition the system understands.
 *
 * Every visual/textual concern about a condition (label, color, symbol,
 * category, palette order) lives here. To add a new finding:
 *   1. Add the enum value in backend ToothCondition.java
 *   2. Add the literal in odontogram.types.ts ToothCondition
 *   3. Add an entry to CONDITION_META below
 *   4. (Optional) add a Tailwind color token in tailwind.config.ts if you
 *      want a dedicated tooth-<name> class. Otherwise it falls back to the
 *      generic muted color.
 *
 * That's it. The palette, the dialog, the legend, the chart cell and the
 * Spanish labels all derive from this map automatically.
 *
 * Convention (Norma Técnica del Odontograma, LatAm):
 *   AZUL  = already done / stable finding
 *   ROJO  = pending treatment / active pathology
 * For now we use a per-condition color (legacy) but the `state` field on a
 * future "ToothFinding" entity will let us switch every finding between
 * "blue" (existente) and "red" (a realizar) without touching this file.
 */

import type { ToothCondition } from '../types/odontogram.types'

export type ConditionCategory =
  | 'restorative' // restauradora / quirúrgica
  | 'periodontal' // gingival / periodontal
  | 'anomaly'     // posición / desarrollo
  | 'function'    // función / desgaste

export interface ConditionMeta {
  /** Backend enum literal (also the API value) */
  key: ToothCondition
  /** Spanish label shown in UI */
  label: string
  /** Tailwind `bg-tooth-*` token (without prefix) */
  color: string
  /** Single glyph rendered on top of the tooth SVG. '' = no glyph (only fill). */
  symbol: string
  /** Category for grouping in the palette / legend */
  category: ConditionCategory
  /**
   * Higher = shown first in the palette. The clinic uses 1–10 as "most
   * common", 11–20 as "secondary", 21+ as "rare". Adjust at will.
   */
  order: number
  /**
   * If true, the label/chip uses dark text on the colored background
   * (because the background is light). Defaults to white text.
   */
  darkText?: boolean
}

/**
 * Ordering rationale: the most-used findings in everyday Argentine dental
 * practice come first (Caries, Restauración, Endodoncia, etc.). Periodontal
 * findings go in the middle so the periodontist has them at hand. Anomalies
 * and function are at the end because they are recorded less often.
 *
 * Symbols follow the Peruvian Norma Técnica del Odontograma where applicable;
 * for findings that the Norma does not cover (gingivitis, calculus, abscess
 * which belong to the periodontograma, not the odontograma) we use the
 * universal short Spanish abbreviation.
 */
export const CONDITION_META: Record<ToothCondition, ConditionMeta> = {
  // ---------- Restorative / surgical ----------
  HEALTHY:     { key: 'HEALTHY',     label: 'Sano',                  color: 'healthy',     symbol: '',    category: 'restorative', order: 100, darkText: true },
  CARIES:      { key: 'CARIES',      label: 'Caries',                color: 'caries',      symbol: '',    category: 'restorative', order: 95 },
  RESTORATION: { key: 'RESTORATION', label: 'Restauración',          color: 'restoration', symbol: '',    category: 'restorative', order: 90 },
  ENDODONTICS: { key: 'ENDODONTICS', label: 'Endodoncia',            color: 'endodontics', symbol: 'TC',  category: 'restorative', order: 85 },
  CROWN:       { key: 'CROWN',       label: 'Corona',                color: 'crown',       symbol: '◯',   category: 'restorative', order: 80 },
  EXTRACTED:   { key: 'EXTRACTED',   label: 'Extraído',              color: 'extracted',   symbol: 'X',   category: 'restorative', order: 75 },
  MISSING:     { key: 'MISSING',     label: 'Ausente',               color: 'missing',     symbol: 'X',   category: 'restorative', order: 70 },
  IMPLANT:     { key: 'IMPLANT',     label: 'Implante',              color: 'implant',     symbol: 'IMP', category: 'restorative', order: 65 },
  PROSTHESIS:  { key: 'PROSTHESIS',  label: 'Prótesis',              color: 'crown',       symbol: 'PT',  category: 'restorative', order: 60 },
  FRACTURE:    { key: 'FRACTURE',    label: 'Fractura',              color: 'caries',      symbol: '/',   category: 'restorative', order: 55 },
  SEALANT:     { key: 'SEALANT',     label: 'Sellante',              color: 'restoration', symbol: '✓',   category: 'restorative', order: 50 },

  // ---------- Periodontal ----------
  GINGIVITIS:          { key: 'GINGIVITIS',         label: 'Gingivitis',         color: 'gingivitis', symbol: 'G',   category: 'periodontal', order: 45 },
  CALCULUS:            { key: 'CALCULUS',           label: 'Cálculo / Sarro',    color: 'calculus',   symbol: 'S',   category: 'periodontal', order: 40 },
  GINGIVAL_RECESSION:  { key: 'GINGIVAL_RECESSION', label: 'Recesión gingival',  color: 'recession',  symbol: '↓',   category: 'periodontal', order: 35 },
  ABSCESS:             { key: 'ABSCESS',            label: 'Absceso',            color: 'abscess',    symbol: 'A',   category: 'periodontal', order: 30 },

  // ---------- Anomalies / positioning ----------
  ROTATION:    { key: 'ROTATION',    label: 'Giroversión',          color: 'rotation',    symbol: '↻',   category: 'anomaly', order: 28 },
  MALPOSITION: { key: 'MALPOSITION', label: 'Malposición',          color: 'malposition', symbol: '↔',   category: 'anomaly', order: 26, darkText: true },
  DIASTEMA:    { key: 'DIASTEMA',    label: 'Diastema',             color: 'diastema',    symbol: ')(',  category: 'anomaly', order: 24, darkText: true },
  FUSION:      { key: 'FUSION',      label: 'Fusión',               color: 'fusion',      symbol: 'FU',  category: 'anomaly', order: 22 },
  GEMINATION:  { key: 'GEMINATION',  label: 'Geminación',           color: 'gemination',  symbol: 'GE',  category: 'anomaly', order: 20 },
  IMPACTED:    { key: 'IMPACTED',    label: 'Incluido / Retenido',  color: 'impacted',    symbol: 'I',   category: 'anomaly', order: 18 },

  // ---------- Function / wear ----------
  MOBILITY:    { key: 'MOBILITY',    label: 'Movilidad',            color: 'mobility',    symbol: 'M',   category: 'function', order: 15 },
  BRUXISM:     { key: 'BRUXISM',     label: 'Bruxismo / Desgaste',  color: 'bruxism',     symbol: 'DES', category: 'function', order: 12 },
  OBSERVATION: { key: 'OBSERVATION', label: 'Observación',          color: 'observation', symbol: '!',   category: 'function', order: 5,  darkText: true },
}

/** All conditions sorted by `order` desc — palette/dialog/legend rendering. */
export const CONDITION_ORDER: ToothCondition[] = (
  Object.values(CONDITION_META) as ConditionMeta[]
)
  .sort((a, b) => b.order - a.order)
  .map((m) => m.key)

/** Display label — falls back to the enum literal for forward-compat. */
export const labelOf = (c: ToothCondition): string =>
  CONDITION_META[c]?.label ?? c

/** Tailwind fill class for the tooth SVG. */
export const fillClassOf = (c: ToothCondition): string =>
  `fill-tooth-${CONDITION_META[c]?.color ?? 'missing'}`

/** Tailwind bg class for chips/badges. */
export const bgClassOf = (c: ToothCondition): string =>
  `bg-tooth-${CONDITION_META[c]?.color ?? 'missing'}`

/** Glyph for the tooth SVG overlay. '' (or undefined) means no overlay. */
export const symbolOf = (c: ToothCondition): string =>
  CONDITION_META[c]?.symbol ?? ''

/** Whether the chip background needs dark text instead of white. */
export const needsDarkTextOn = (c: ToothCondition): boolean =>
  CONDITION_META[c]?.darkText === true

/** Category-grouped order for sectioned UIs (legend, palette tabs). */
export const CONDITIONS_BY_CATEGORY: Record<ConditionCategory, ToothCondition[]> = {
  restorative: CONDITION_ORDER.filter((c) => CONDITION_META[c].category === 'restorative'),
  periodontal: CONDITION_ORDER.filter((c) => CONDITION_META[c].category === 'periodontal'),
  anomaly:     CONDITION_ORDER.filter((c) => CONDITION_META[c].category === 'anomaly'),
  function:    CONDITION_ORDER.filter((c) => CONDITION_META[c].category === 'function'),
}

export const CATEGORY_LABEL: Record<ConditionCategory, string> = {
  restorative: 'Restauradora / Quirúrgica',
  periodontal: 'Periodontal',
  anomaly:     'Anomalías / Posición',
  function:    'Función / Desgaste',
}
