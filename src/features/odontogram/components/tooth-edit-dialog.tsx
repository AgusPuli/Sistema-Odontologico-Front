'use client'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TREATMENT_STATUS_LABEL } from '@/lib/constants'
import { CONDITION_ORDER, labelOf } from '../config/conditions'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  ToothCondition,
  ToothRecord,
  TreatmentStatus,
} from '../types/odontogram.types'
import { useToothHistory, useUpdateTooth } from '../hooks/use-odontogram'
import { useTreatmentsBySpecialty } from '@/features/treatments/hooks/use-treatments'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface Props {
  open: boolean
  onClose: () => void
  odontogramId: string
  fdi: number | null
  tooth?: ToothRecord
}

// Sourced from config/conditions.ts so adding a finding doesn't require touching this file.
const CONDITIONS: ToothCondition[] = CONDITION_ORDER

const STATUSES: TreatmentStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export function ToothEditDialog({ open, onClose, odontogramId, fdi, tooth }: Props) {
  const { user } = useAuth()
  const update = useUpdateTooth(odontogramId)
  const { data: history } = useToothHistory(open ? odontogramId : undefined, open ? fdi : null)
  // The dentist's specialty drives which treatments to suggest first
  const { data: specialtyTreatments } = useTreatmentsBySpecialty(user?.specialty ?? undefined)

  const [condition, setCondition] = useState<ToothCondition>('HEALTHY')
  const [status, setStatus] = useState<TreatmentStatus>('PENDING')
  const [note, setNote] = useState('')
  const [treatmentId, setTreatmentId] = useState<string>('')

  useEffect(() => {
    if (open) {
      setCondition(tooth?.condition ?? 'HEALTHY')
      setStatus('PENDING')
      setNote(tooth?.observation ?? '')
      setTreatmentId('')
    }
  }, [open, tooth])

  if (fdi == null) return null

  const handleSubmit = () => {
    update.mutate(
      {
        fdiNumber: fdi,
        data: {
          condition,
          observation: note || undefined,
          treatmentStatus: status,
          historyNote: note || undefined,
          treatmentId: treatmentId || undefined,
        },
      },
      {
        onSuccess: () => onClose(),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pieza {fdi}</DialogTitle>
          <DialogDescription>
            Registrá hallazgo, estado del tratamiento y nota. Cada cambio queda en el historial.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Hallazgo</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as ToothCondition)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {labelOf(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TreatmentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {TREATMENT_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Tratamiento del catálogo (opcional)</Label>
            <Select value={treatmentId || 'none'} onValueChange={(v) => setTreatmentId(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sin tratamiento asociado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin tratamiento asociado</SelectItem>
                {specialtyTreatments?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.code} — {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!user?.specialty && (
              <p className="text-xs text-muted-foreground">
                Configurá tu especialidad en &quot;Mi cuenta&quot; para ver tratamientos sugeridos.
              </p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nota</Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label>Historial clínico de la pieza</Label>
          <div className="max-h-44 space-y-2 overflow-y-auto pr-2 text-sm">
            {(!history || history.length === 0) && (
              <p className="text-muted-foreground">Todavía no hay registros para esta pieza.</p>
            )}
            {history?.map((h) => (
              <div key={h.id} className="rounded-md border p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {labelOf(h.finding)}
                    {h.surface && <span className="ml-1 text-xs text-muted-foreground">({h.surface})</span>}
                  </span>
                  <Badge variant="outline">{TREATMENT_STATUS_LABEL[h.treatmentStatus]}</Badge>
                </div>
                {h.treatmentName && (
                  <p className="text-xs text-muted-foreground">
                    {h.treatmentCode} · {h.treatmentName}
                  </p>
                )}
                {h.note && <p className="mt-1 text-xs">{h.note}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatDate(h.recordedAt, true)} {h.recordedByEmail ? `· ${h.recordedByEmail}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={update.isPending}>
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar cambio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
