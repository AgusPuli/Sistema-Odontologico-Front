'use client'
import { cn } from '@/lib/utils'
import { TOOTH_CONDITION_LABEL } from '@/lib/constants'
import type { ToothCondition } from '../types/odontogram.types'

/**
 * Color chip per condition — matches the tooth fill colors so the palette
 * doubles as a legend. Tailwind classes referenced here must exist in
 * tailwind.config.ts under `theme.extend.colors.tooth`.
 */
const CONDITION_CHIP: Record<ToothCondition, string> = {
  // Restorative / surgical
  HEALTHY: 'bg-tooth-healthy text-emerald-900',
  CARIES: 'bg-tooth-caries text-white',
  EXTRACTED: 'bg-tooth-extracted text-white',
  RESTORATION: 'bg-tooth-restoration text-white',
  ENDODONTICS: 'bg-tooth-endodontics text-white',
  IMPLANT: 'bg-tooth-implant text-white',
  CROWN: 'bg-tooth-crown text-white',
  MISSING: 'bg-tooth-missing text-white',
  PROSTHESIS: 'bg-tooth-crown text-white',
  FRACTURE: 'bg-tooth-caries text-white',
  SEALANT: 'bg-tooth-restoration text-white',
  OBSERVATION: 'bg-tooth-observation text-zinc-900',
  // Periodontal
  GINGIVITIS: 'bg-tooth-gingivitis text-white',
  CALCULUS: 'bg-tooth-calculus text-white',
  GINGIVAL_RECESSION: 'bg-tooth-recession text-white',
  ABSCESS: 'bg-tooth-abscess text-white',
  // Anomalies / positioning
  FUSION: 'bg-tooth-fusion text-white',
  GEMINATION: 'bg-tooth-gemination text-white',
  ROTATION: 'bg-tooth-rotation text-white',
  MALPOSITION: 'bg-tooth-malposition text-zinc-900',
  DIASTEMA: 'bg-tooth-diastema text-zinc-900',
  IMPACTED: 'bg-tooth-impacted text-white',
  // Function / wear
  MOBILITY: 'bg-tooth-mobility text-white',
  BRUXISM: 'bg-tooth-bruxism text-white',
}

/**
 * Order shown in the palette. Grouped by category and ordered by clinical
 * frequency — restorative/surgical first (most-used), then periodontal,
 * anomalies, and finally function/wear.
 */
const ORDER: ToothCondition[] = [
  // Most used first
  'HEALTHY',
  'CARIES',
  'RESTORATION',
  'ENDODONTICS',
  'CROWN',
  'EXTRACTED',
  'MISSING',
  'IMPLANT',
  'PROSTHESIS',
  'FRACTURE',
  'SEALANT',
  // Periodontal
  'GINGIVITIS',
  'CALCULUS',
  'GINGIVAL_RECESSION',
  'ABSCESS',
  // Positioning / anomalies
  'ROTATION',
  'MALPOSITION',
  'DIASTEMA',
  'FUSION',
  'GEMINATION',
  'IMPACTED',
  // Function
  'MOBILITY',
  'BRUXISM',
  'OBSERVATION',
]

interface Props {
  active: ToothCondition
  onChange: (c: ToothCondition) => void
}

export function FindingPalette({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORDER.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition-all',
            CONDITION_CHIP[c],
            active === c
              ? 'ring-2 ring-offset-1 ring-primary scale-105'
              : 'opacity-80 hover:opacity-100',
          )}
        >
          {TOOTH_CONDITION_LABEL[c] ?? c}
        </button>
      ))}
    </div>
  )
}
