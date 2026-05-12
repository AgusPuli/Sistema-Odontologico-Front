'use client'
import { cn } from '@/lib/utils'
import type { ToothCondition, ToothRecord, ToothSurface } from '../types/odontogram.types'

/**
 * Visual color for a given condition. Tailwind tokens are defined in tailwind.config.ts
 * under `theme.extend.colors.tooth`.
 */
const CONDITION_COLOR: Record<ToothCondition, string> = {
  // Restorative / surgical
  HEALTHY: 'fill-tooth-healthy',
  CARIES: 'fill-tooth-caries',
  EXTRACTED: 'fill-tooth-extracted',
  RESTORATION: 'fill-tooth-restoration',
  ENDODONTICS: 'fill-tooth-endodontics',
  IMPLANT: 'fill-tooth-implant',
  CROWN: 'fill-tooth-crown',
  MISSING: 'fill-tooth-missing',
  PROSTHESIS: 'fill-tooth-crown',
  FRACTURE: 'fill-tooth-caries',
  SEALANT: 'fill-tooth-restoration',
  OBSERVATION: 'fill-tooth-observation',
  // Periodontal
  GINGIVITIS: 'fill-tooth-gingivitis',
  CALCULUS: 'fill-tooth-calculus',
  GINGIVAL_RECESSION: 'fill-tooth-recession',
  ABSCESS: 'fill-tooth-abscess',
  // Anomalies / positioning
  FUSION: 'fill-tooth-fusion',
  GEMINATION: 'fill-tooth-gemination',
  ROTATION: 'fill-tooth-rotation',
  MALPOSITION: 'fill-tooth-malposition',
  DIASTEMA: 'fill-tooth-diastema',
  IMPACTED: 'fill-tooth-impacted',
  // Function / wear
  MOBILITY: 'fill-tooth-mobility',
  BRUXISM: 'fill-tooth-bruxism',
}

/**
 * Tiny symbol overlaid on top of the tooth when the condition has one.
 * Mirrors the way reference dental software annotates findings:
 *   G  = gingivitis
 *   ↻  = giroversión (rotation)
 *   ↔  = movilidad / malposición
 *   ▼  = diente retenido / incluido
 *   ≈  = bruxismo / desgaste
 * Empty string = no overlay (the fill color alone is enough).
 */
const CONDITION_SYMBOL: Partial<Record<ToothCondition, string>> = {
  GINGIVITIS: 'G',
  CALCULUS: 'S', // sarro
  GINGIVAL_RECESSION: '↓',
  ABSCESS: 'A',
  FUSION: 'F',
  GEMINATION: '○',
  ROTATION: '↻',
  MALPOSITION: '↔',
  DIASTEMA: '║',
  IMPACTED: '▼',
  MOBILITY: 'M',
  BRUXISM: '≈',
  ENDODONTICS: 'E',
  IMPLANT: 'I',
  CROWN: 'C',
  EXTRACTED: '✕',
  MISSING: '−',
  FRACTURE: '/',
  SEALANT: '✓',
}

const NEUTRAL = 'fill-white dark:fill-zinc-800'

/**
 * Each tooth is a 60x60 SVG with 5 polygons:
 *   - center square = occlusal (O) for posterior teeth, incisal (I) for anteriors
 *   - top triangle = vestibular (V)
 *   - bottom triangle = lingual (L)
 *   - left triangle = distal (D)  [right-quadrant teeth]   /  mesial (M) for left-quadrant teeth
 *   - right triangle = mesial (M) [right-quadrant teeth]   /  distal (D) for left-quadrant teeth
 *
 * For the MVP we keep the mapping simple: regardless of quadrant, M is right and D is left.
 * The clinic can add proper quadrant-based mirroring later.
 */
const SURFACE_PATHS: Record<Exclude<ToothSurface, 'O' | 'I'>, string> = {
  V: '5,5 55,5 40,20 20,20',
  L: '20,40 40,40 55,55 5,55',
  M: '55,5 55,55 40,40 40,20',
  D: '5,5 5,55 20,40 20,20',
}

const CENTER_RECT = { x: 20, y: 20, width: 20, height: 20 }

interface Props {
  fdi: number
  tooth?: ToothRecord
  selected?: boolean
  onClick?: (fdi: number) => void
}

export function ToothCell({ fdi, tooth, selected, onClick }: Props) {
  const wholeColor = tooth ? CONDITION_COLOR[tooth.condition] : NEUTRAL

  // Map per-surface findings to a color, falling back to the whole-tooth color
  const surfaceColor = (surface: ToothSurface): string => {
    const finding = tooth?.surfaces?.find((s) => s.surface === surface)
    if (finding) return CONDITION_COLOR[finding.condition]
    return wholeColor
  }

  const center = tooth?.surfaces?.find((s) => s.surface === 'O' || s.surface === 'I')
  const centerColor = center ? CONDITION_COLOR[center.condition] : wholeColor

  // Overlay glyph for the whole-tooth condition (e.g. "G" for gingivitis).
  // Surface findings keep their color from the polygon; the symbol is only
  // for diagnoses that are easier to read as a letter than as a color.
  const symbol = tooth?.condition ? CONDITION_SYMBOL[tooth.condition] : undefined

  return (
    <button
      type="button"
      onClick={() => onClick?.(fdi)}
      className={cn(
        'flex flex-col items-center gap-1 rounded-md p-1 transition-colors hover:bg-accent',
        selected && 'bg-accent ring-2 ring-primary'
      )}
      title={`Pieza ${fdi}`}
    >
      <span className="text-[10px] font-mono text-muted-foreground">{fdi}</span>
      <svg viewBox="0 0 60 60" width={48} height={48} className="rounded-sm border border-border">
        {/* V (top) */}
        <polygon
          points={SURFACE_PATHS.V}
          className={cn(surfaceColor('V'), 'stroke-border')}
          strokeWidth={0.5}
        />
        {/* L (bottom) */}
        <polygon
          points={SURFACE_PATHS.L}
          className={cn(surfaceColor('L'), 'stroke-border')}
          strokeWidth={0.5}
        />
        {/* M (right) */}
        <polygon
          points={SURFACE_PATHS.M}
          className={cn(surfaceColor('M'), 'stroke-border')}
          strokeWidth={0.5}
        />
        {/* D (left) */}
        <polygon
          points={SURFACE_PATHS.D}
          className={cn(surfaceColor('D'), 'stroke-border')}
          strokeWidth={0.5}
        />
        {/* Center: O for posteriors / I for anteriors */}
        <rect
          {...CENTER_RECT}
          className={cn(centerColor, 'stroke-border')}
          strokeWidth={0.5}
        />
        {/* Overlay glyph: e.g. "G" for gingivitis, "↻" for giroversión */}
        {symbol && (
          <text
            x={30}
            y={34}
            textAnchor="middle"
            className="pointer-events-none fill-zinc-900 dark:fill-white"
            style={{ fontSize: 16, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}
          >
            {symbol}
          </text>
        )}
      </svg>
    </button>
  )
}
