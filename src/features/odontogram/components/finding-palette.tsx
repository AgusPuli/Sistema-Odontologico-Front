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
}

/** Order matches what we want surfaced in the UI — most-used first. */
const ORDER: ToothCondition[] = [
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
