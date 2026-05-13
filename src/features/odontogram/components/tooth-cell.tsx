'use client'
import { cn } from '@/lib/utils'
import type { ToothRecord, ToothSurface } from '../types/odontogram.types'
import { fillClassOf, symbolOf } from '../config/conditions'

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
 *
 * Visual semantics live in config/conditions.ts — this component only knows how
 * to lay out polygons and ask the config "what's the color/symbol for X?".
 */
const SURFACE_PATHS: Record<Exclude<ToothSurface, 'O' | 'I'>, string> = {
  V: '5,5 55,5 40,20 20,20',
  L: '20,40 40,40 55,55 5,55',
  M: '55,5 55,55 40,40 40,20',
  D: '5,5 5,55 20,40 20,20',
}

const CENTER_RECT = { x: 20, y: 20, width: 20, height: 20 }
const NEUTRAL = 'fill-white dark:fill-zinc-800'

interface Props {
  fdi: number
  tooth?: ToothRecord
  selected?: boolean
  onClick?: (fdi: number) => void
}

export function ToothCell({ fdi, tooth, selected, onClick }: Props) {
  const wholeColor = tooth ? fillClassOf(tooth.condition) : NEUTRAL

  // Map per-surface findings to a color, falling back to the whole-tooth color
  const surfaceColor = (surface: ToothSurface): string => {
    const finding = tooth?.surfaces?.find((s) => s.surface === surface)
    if (finding) return fillClassOf(finding.condition)
    return wholeColor
  }

  const center = tooth?.surfaces?.find((s) => s.surface === 'O' || s.surface === 'I')
  const centerColor = center ? fillClassOf(center.condition) : wholeColor

  // Overlay glyph for the whole-tooth condition (e.g. "G" for gingivitis).
  // Surface findings keep their color from the polygon; the symbol is only
  // for diagnoses that are easier to read as a letter than as a color.
  const symbol = tooth?.condition ? symbolOf(tooth.condition) : ''
  // Auto-shrink multi-char glyphs (IMP, DES, TC) so they fit in the 20x20 center.
  const glyphSize = symbol.length >= 2 ? 11 : 16

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
        {/* Overlay glyph from config/conditions.ts — '' = no overlay */}
        {symbol && (
          <text
            x={30}
            y={34}
            textAnchor="middle"
            className="pointer-events-none fill-zinc-900 dark:fill-white"
            style={{ fontSize: glyphSize, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}
          >
            {symbol}
          </text>
        )}
      </svg>
    </button>
  )
}
