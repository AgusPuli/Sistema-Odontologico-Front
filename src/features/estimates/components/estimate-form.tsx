'use client'
import { useMemo, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/form-field'
import { EmptyState } from '@/components/shared/empty-state'
import { formatMoney } from '@/lib/utils'
import { useTreatmentsSearch } from '@/features/treatments/hooks/use-treatments'
import type { Treatment } from '@/features/treatments/types/treatment.types'
import type {
  CreateEstimateRequest,
  Estimate,
} from '../types/estimate.types'

interface RowDraft {
  treatmentId: string
  treatmentName: string
  fdiNumber: string
  quantity: number
  unitPrice: number
}

interface Props {
  patientId: string
  initialValues?: Estimate
  onSubmit: (values: CreateEstimateRequest) => void
  isSubmitting?: boolean
  submitLabel?: string
}

/**
 * Estimate (presupuesto) form. Items use a row-by-row builder: pick a treatment
 * from the catalog, optionally tag the FDI tooth number, edit qty/price,
 * total recomputes live. Submit shape matches backend CreateEstimateRequest.
 */
export function EstimateForm({
  patientId,
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Guardar',
}: Props) {
  const [validUntil, setValidUntil] = useState<string>(initialValues?.validUntil ?? '')
  const [notes, setNotes] = useState<string>(initialValues?.notes ?? '')
  const [rows, setRows] = useState<RowDraft[]>(
    (initialValues?.items ?? []).map((it) => ({
      treatmentId: it.treatmentId,
      treatmentName: it.treatmentName,
      fdiNumber: it.fdiNumber != null ? String(it.fdiNumber) : '',
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    }))
  )

  // Pick a healthy default page size — clinics rarely have more than 60 treatments
  const { data: catalog } = useTreatmentsSearch({ size: 200 })
  const treatments: Treatment[] = catalog?.content ?? []

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0),
    [rows]
  )

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { treatmentId: '', treatmentName: '', fdiNumber: '', quantity: 1, unitPrice: 0 },
    ])
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const updateRow = <K extends keyof RowDraft>(index: number, key: K, value: RowDraft[K]) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)))
  }

  const onPickTreatment = (index: number, treatmentId: string) => {
    const t = treatments.find((x) => x.id === treatmentId)
    setRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              treatmentId,
              treatmentName: t?.name ?? '',
              // Prefill price with the catalog default if the row had no price
              unitPrice: r.unitPrice > 0 ? r.unitPrice : Number(t?.defaultPrice ?? 0),
            }
          : r
      )
    )
  }

  const submit = () => {
    const items = rows
      .filter((r) => r.treatmentId)
      .map((r) => ({
        treatmentId: r.treatmentId,
        fdiNumber: r.fdiNumber ? Number(r.fdiNumber) : undefined,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
      }))
    onSubmit({
      patientId,
      validUntil: validUntil || undefined,
      notes: notes || undefined,
      items,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="validUntil" label="Válido hasta">
          <Input
            id="validUntil"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </FormField>
      </div>

      <FormField id="notes" label="Notas">
        <Textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Detalles del presupuesto, condiciones, etc."
        />
      </FormField>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4" /> Agregar item
            </Button>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              variant="block"
              title="Sin items"
              description="Agregá al menos un tratamiento del catálogo para generar el presupuesto."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Tratamiento</TableHead>
                  <TableHead className="w-[10%]">Pieza</TableHead>
                  <TableHead className="w-[10%]">Cantidad</TableHead>
                  <TableHead className="w-[15%]">Precio unitario</TableHead>
                  <TableHead className="w-[15%]">Subtotal</TableHead>
                  <TableHead className="w-[10%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Select
                        value={row.treatmentId || undefined}
                        onValueChange={(v) => onPickTreatment(idx, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Elegir tratamiento" />
                        </SelectTrigger>
                        <SelectContent>
                          {treatments.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              <span className="font-mono text-xs text-muted-foreground">{t.code}</span>{' '}
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={11}
                        max={85}
                        placeholder="—"
                        value={row.fdiNumber}
                        onChange={(e) => updateRow(idx, 'fdiNumber', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, 'quantity', Number(e.target.value) || 1)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={row.unitPrice}
                        onChange={(e) => updateRow(idx, 'unitPrice', Number(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(row.quantity * row.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex justify-end gap-6 border-t pt-3">
            <span className="text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{formatMoney(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" onClick={submit} disabled={isSubmitting || rows.length === 0}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
