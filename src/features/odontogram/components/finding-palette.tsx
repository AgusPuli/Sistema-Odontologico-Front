'use client'
import { cn } from '@/lib/utils'
import type { ToothCondition } from '../types/odontogram.types'
import {
  CONDITION_META,
  CONDITION_ORDER,
  bgClassOf,
  labelOf,
  needsDarkTextOn,
} from '../config/conditions'

interface Props {
  active: ToothCondition
  onChange: (c: ToothCondition) => void
  /** When true, render the palette grouped by category. Default: flat list. */
  grouped?: boolean
}

/**
 * Renders one button per `ToothCondition`, sourced from config/conditions.ts.
 * Adding/removing a finding or re-ordering the palette happens in that file —
 * this component does not enumerate conditions itself.
 */
export function FindingPalette({ active, onChange, grouped = false }: Props) {
  if (!grouped) {
    return (
      <div className="flex flex-wrap gap-2">
        {CONDITION_ORDER.map((c) => (
          <ConditionButton key={c} c={c} active={active === c} onClick={() => onChange(c)} />
        ))}
      </div>
    )
  }

  // Grouped mode — useful when the palette grows large.
  const groups: Record<string, ToothCondition[]> = {}
  for (const c of CONDITION_ORDER) {
    const cat = CONDITION_META[c].category
    ;(groups[cat] ||= []).push(c)
  }
  return (
    <div className="space-y-2">
      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat}>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {items.map((c) => (
              <ConditionButton key={c} c={c} active={active === c} onClick={() => onChange(c)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ConditionButton({
  c,
  active,
  onClick,
}: {
  c: ToothCondition
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition-all',
        bgClassOf(c),
        needsDarkTextOn(c) ? 'text-zinc-900' : 'text-white',
        active
          ? 'ring-2 ring-offset-1 ring-primary scale-105'
          : 'opacity-80 hover:opacity-100',
      )}
    >
      {labelOf(c)}
    </button>
  )
}
