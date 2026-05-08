'use client'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { Odontogram } from '../types/odontogram.types'
import { chartRows } from '../utils/fdi'
import { ToothCell } from './tooth-cell'

interface Props {
  odontogram: Odontogram
  selectedFdi?: number | null
  onSelectTooth?: (fdi: number) => void
}

/**
 * Chart layout: shows each row in the order returned by chartRows().
 * The middle of each row gets a vertical separator so the upper-right /
 * upper-left split is visible (mimics how dental software lays it out).
 */
export function OdontogramChart({ odontogram, selectedFdi, onSelectTooth }: Props) {
  const byFdi = new Map(odontogram.teeth.map((t) => [t.fdiNumber, t]))
  const rows = chartRows(odontogram.dentition)

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
                return (
                  <div key={fdi} className={cn('flex items-end', isSplit && 'border-l border-dashed border-border pl-2 ml-1')}>
                    <ToothCell
                      fdi={fdi}
                      tooth={byFdi.get(fdi)}
                      selected={selectedFdi === fdi}
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
