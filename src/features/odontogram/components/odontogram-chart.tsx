'use client'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { Odontogram } from '../types/odontogram.types'
import { chartRows } from '../utils/fdi'
import { ToothCell } from './tooth-cell'

interface Props {
  odontogram: Odontogram
  /** Single-select mode (legacy): one tooth highlighted at a time. */
  selectedFdi?: number | null
  /** Multi-select mode: pass a Set; toggle on each click. Wins over selectedFdi when set. */
  selectedFdis?: Set<number>
  onSelectTooth?: (fdi: number) => void
}

/**
 * Chart layout: shows each row in the order returned by chartRows().
 * The middle of each row gets a vertical separator so the upper-right /
 * upper-left split is visible (mimics how dental software lays it out).
 *
 * Supports two selection modes:
 *  - Single (pass `selectedFdi`): the classic odontogram detail page.
 *  - Multi  (pass `selectedFdis`): used by the "Crear tratamiento" flow
 *    so the dentist can apply the same finding to several teeth at once.
 */
export function OdontogramChart({ odontogram, selectedFdi, selectedFdis, onSelectTooth }: Props) {
  const byFdi = new Map(odontogram.teeth.map((t) => [t.fdiNumber, t]))
  const rows = chartRows(odontogram.dentition)
  const isMulti = selectedFdis !== undefined

  return (
    <Card>
      <CardContent className="space-y-4 overflow-x-auto p-4">
        {rows.map((row) => (
          <div key={row.key}>
            <p className="mb-1 text-xs uppercase text-muted-foreground">{row.label}</p>
            <div className={cn('flex flex-wrap items-end gap-1')}>
              {row.teeth.map((fdi, idx) => {
                const half = row.teeth.length / 2
                const isSplit = idx === half
                const isSelected = isMulti ? selectedFdis!.has(fdi) : selectedFdi === fdi
                return (
                  <div key={fdi} className={cn('flex items-end', isSplit && 'border-l border-dashed border-border pl-2 ml-1')}>
                    <ToothCell
                      fdi={fdi}
                      tooth={byFdi.get(fdi)}
                      selected={isSelected}
                      onClick={onSelectTooth}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
