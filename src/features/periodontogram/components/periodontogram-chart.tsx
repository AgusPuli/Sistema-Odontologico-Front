'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/loading-state'
import { PlusCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ToothPerioDialog } from './tooth-perio-dialog'
import {
  useCreatePeriodontogram,
  useCurrentPeriodontogram,
  useUpdatePeriodontalTooth,
} from '../hooks/use-periodontogram'
import { MOLAR_FDI, SITE_ORDER, UPPER_FDI, pdColour } from '../config/labels'
import type {
  PeriodontalToothData,
  UpdatePeriodontalToothRequest,
} from '../types/periodontogram.types'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { periodontogramApi } from '../api/periodontogram.api'
import { useQueryClient } from '@tanstack/react-query'
import { PERIO_KEYS } from '../hooks/use-periodontogram'

interface Props {
  patientId: string
}

/** FDI quadrant order for UI display (left-to-right visually) */
const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

/** Compact cell colour based on worst probing depth across all sites of a tooth. */
function worstPd(tooth: PeriodontalToothData): number | null {
  const pds = tooth.sites.map((s) => s.probingDepth).filter((v): v is number => v != null)
  return pds.length > 0 ? Math.max(...pds) : null
}

function ToothCell({
  tooth,
  onClick,
}: {
  tooth: PeriodontalToothData | undefined
  fdi: number
  onClick: () => void
}) {
  if (!tooth) {
    return (
      <button
        onClick={onClick}
        className="w-10 h-14 rounded border border-dashed border-muted-foreground/30 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
      >
        —
      </button>
    )
  }

  const pd = worstPd(tooth)
  const hasBleeding = tooth.sites.some((s) => s.bleeding)
  const hasPlaque = tooth.sites.some((s) => s.plaque)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-10 h-14 rounded border text-xs font-mono flex flex-col items-center justify-center gap-0.5 transition-colors hover:bg-muted/50',
        pd === null
          ? 'border-muted-foreground/20 bg-background'
          : pd <= 3
            ? 'border-emerald-300 bg-emerald-50'
            : pd <= 5
              ? 'border-amber-300 bg-amber-50'
              : 'border-rose-300 bg-rose-50',
      )}
      title={`Diente ${tooth.fdiNumber}`}
    >
      <span className="text-[10px] text-muted-foreground">{tooth.fdiNumber}</span>
      <span className={cn('font-bold', pdColour(pd))}>{pd ?? '·'}</span>
      <div className="flex gap-0.5">
        {hasBleeding && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
        {hasPlaque && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
      </div>
    </button>
  )
}

export function PeriodontogramChart({ patientId }: Props) {
  const qc = useQueryClient()
  const { data: perio, isLoading, error } = useCurrentPeriodontogram(patientId)
  const { mutate: createNew, isPending: isCreating } = useCreatePeriodontogram(patientId)
  const { mutate: updateTooth, isPending: isSaving } = useUpdatePeriodontalTooth(
    perio?.id ?? '',
    patientId,
  )

  const [selectedTooth, setSelectedTooth] = useState<PeriodontalToothData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const noChart = !isLoading && (error || !perio)

  function handleToothClick(fdi: number) {
    if (!perio) return
    const tooth = perio.teeth.find((t) => t.fdiNumber === fdi)
    setSelectedTooth(tooth ?? { id: '', fdiNumber: fdi, mobility: null, furcation: null, notes: null, sites: [] })
    setDialogOpen(true)
  }

  function handleSave(fdi: number, req: UpdatePeriodontalToothRequest) {
    updateTooth(
      { fdiNumber: fdi, req },
      { onSuccess: () => setDialogOpen(false) },
    )
  }

  async function handleGetOrCreate() {
    try {
      const result = await periodontogramApi.getOrCreateCurrent({ patientId })
      qc.setQueryData(PERIO_KEYS.currentForPatient(patientId), result)
      toast.success('Periodontograma listo')
    } catch {
      toast.error('No se pudo iniciar el periodontograma')
    }
  }

  if (isLoading) return <LoadingState />

  if (noChart) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <p className="text-muted-foreground text-sm">
            Este paciente no tiene un periodontograma activo.
          </p>
          <Button onClick={handleGetOrCreate} disabled={isCreating}>
            <PlusCircle className="h-4 w-4" />
            Iniciar periodontograma
          </Button>
        </CardContent>
      </Card>
    )
  }

  const toothMap = new Map(perio!.teeth.map((t) => [t.fdiNumber, t]))

  return (
    <div className="space-y-4">
      {/* ── Header / indices ──────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">
            Examen: <strong>{formatDate(perio!.examDate)}</strong>
          </span>
          {perio!.bleedingIndex != null && (
            <Badge variant="outline" className="border-rose-300 text-rose-600">
              Sangrado {Number(perio!.bleedingIndex).toFixed(1)}%
            </Badge>
          )}
          {perio!.plaqueIndex != null && (
            <Badge variant="outline" className="border-yellow-400 text-yellow-700">
              Placa {Number(perio!.plaqueIndex).toFixed(1)}%
            </Badge>
          )}
          {!perio!.current && (
            <Badge variant="secondary">Histórico</Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            createNew({ patientId }, { onSuccess: () => toast.success('Nuevo examen iniciado') })
          }
          disabled={isCreating}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Nuevo examen
        </Button>
      </div>

      {/* ── Legend ────────────────────────────────────────────────── */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> PD ≤3 mm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> PD 4-5 mm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> PD ≥6 mm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Sangrado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Placa
        </span>
      </div>

      {/* ── Tooth grids ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
            Arcada superior
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 flex-wrap justify-center">
            {UPPER_ROW.map((fdi) => (
              <ToothCell
                key={fdi}
                fdi={fdi}
                tooth={toothMap.get(fdi)}
                onClick={() => handleToothClick(fdi)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
            Arcada inferior
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 flex-wrap justify-center">
            {LOWER_ROW.map((fdi) => (
              <ToothCell
                key={fdi}
                fdi={fdi}
                tooth={toothMap.get(fdi)}
                onClick={() => handleToothClick(fdi)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {perio!.generalNotes && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{perio!.generalNotes}</p>
          </CardContent>
        </Card>
      )}

      <ToothPerioDialog
        tooth={selectedTooth}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
}
