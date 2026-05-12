'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronsRight, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { FormField } from '@/components/shared/form-field'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState } from '@/components/shared/loading-state'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { TOOTH_CONDITION_LABEL } from '@/lib/constants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { usePatientsList, usePatient } from '@/features/patients/hooks/use-patients'
import {
  useGetOrCreateOdontogram,
  useUpdateTooth,
} from '@/features/odontogram/hooks/use-odontogram'
import { OdontogramChart } from '@/features/odontogram/components/odontogram-chart'
import { FindingPalette } from '@/features/odontogram/components/finding-palette'
import { useTreatmentsSearch } from '@/features/treatments/hooks/use-treatments'
import { useCreateEstimate } from '@/features/estimates/hooks/use-estimates'
import type {
  Dentition,
  Odontogram,
  ToothCondition,
} from '@/features/odontogram/types/odontogram.types'

/**
 * Single draft entry in the "Plan de tratamiento" table — one per (fdi, condition)
 * tuple. On submit each becomes a PUT /odontograms/{id}/teeth/{fdi}.
 */
interface DraftFinding {
  fdiNumber: number
  condition: ToothCondition
  note: string
}

/**
 * Single draft service in the "Servicios" table. On submit they collectively
 * become one POST /estimates with these as items.
 */
interface DraftService {
  treatmentId: string
  treatmentCode: string
  treatmentName: string
  fdiNumber: number | null
  quantity: number
  unitPrice: number
}

/**
 * "Crear tratamiento" — one-shot form that lets the dentist:
 *  1. Pick a patient
 *  2. Open (or create) the patient's current odontogram
 *  3. Apply findings to multiple teeth in batch via the FindingPalette
 *  4. Add billable services from the catalog
 *  5. Save everything atomically (sort of — chained calls, see submit())
 */
export default function NewTreatmentPage() {
  const router = useRouter()
  const params = useSearchParams()
  const presetPatientId = params.get('patientId') ?? ''

  const { user } = useAuth()

  // ---------------- Form header ----------------
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [dentition, setDentition] = useState<Dentition>('PERMANENT')
  const [notes, setNotes] = useState('')

  // ---------------- Patient selection ----------------
  const [patientSearch, setPatientSearch] = useState('')
  const debouncedSearch = useDebouncedValue(patientSearch, 300)
  const { data: patientsPage, isLoading: loadingPatients } = usePatientsList({
    search: debouncedSearch,
    size: 30,
  })
  const [patientId, setPatientId] = useState(presetPatientId)
  const { data: patient } = usePatient(patientId || undefined)

  // ---------------- Odontogram (lazy get-or-create) ----------------
  const getOrCreate = useGetOrCreateOdontogram()
  const [odontogram, setOdontogram] = useState<Odontogram | null>(null)

  // Fetch (idempotent) when both patient + dentition are set
  useEffect(() => {
    if (!patientId) {
      setOdontogram(null)
      return
    }
    getOrCreate.mutate(
      { patientId, dentition },
      {
        onSuccess: (r) => setOdontogram(r.data),
        onError: () => setOdontogram(null),
      },
    )
    // We intentionally only re-run on patientId / dentition change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, dentition])

  // ---------------- Multi-tooth selection ----------------
  const [selectedFdis, setSelectedFdis] = useState<Set<number>>(new Set())
  const [activeCondition, setActiveCondition] = useState<ToothCondition>('CARIES')
  const [bulkNote, setBulkNote] = useState('')

  const toggleTooth = (fdi: number) => {
    setSelectedFdis((prev) => {
      const next = new Set(prev)
      if (next.has(fdi)) next.delete(fdi)
      else next.add(fdi)
      return next
    })
  }

  // ---------------- Drafts ----------------
  const [findingsDraft, setFindingsDraft] = useState<DraftFinding[]>([])
  const [servicesDraft, setServicesDraft] = useState<DraftService[]>([])

  /** Apply the current palette finding to every selected tooth, then clear selection. */
  const applyFindingToSelected = () => {
    if (selectedFdis.size === 0) {
      toast.info('Seleccioná al menos un diente')
      return
    }
    setFindingsDraft((prev) => {
      const next = [...prev]
      for (const fdi of selectedFdis) {
        // De-dup: if same (fdi, condition) already in draft, replace its note instead.
        const existing = next.findIndex(
          (d) => d.fdiNumber === fdi && d.condition === activeCondition,
        )
        const entry: DraftFinding = {
          fdiNumber: fdi,
          condition: activeCondition,
          note: bulkNote,
        }
        if (existing >= 0) next[existing] = entry
        else next.push(entry)
      }
      return next
    })
    setSelectedFdis(new Set())
    setBulkNote('')
  }

  const removeFindingDraft = (idx: number) =>
    setFindingsDraft((p) => p.filter((_, i) => i !== idx))

  // ---------------- Services search ----------------
  const [serviceSearch, setServiceSearch] = useState('')
  const debouncedServiceSearch = useDebouncedValue(serviceSearch, 300)
  const { data: catalogPage, isLoading: loadingCatalog } = useTreatmentsSearch({
    specialty: user?.specialty ?? undefined,
    search: debouncedServiceSearch,
    size: 20,
  })

  const addServiceFromCatalog = (treatmentId: string) => {
    const t = catalogPage?.content.find((x) => x.id === treatmentId)
    if (!t) return
    setServicesDraft((prev) => [
      ...prev,
      {
        treatmentId: t.id,
        treatmentCode: t.code,
        treatmentName: t.name,
        fdiNumber: null,
        quantity: 1,
        unitPrice: Number(t.defaultPrice ?? 0),
      },
    ])
  }
  const updateService = (idx: number, patch: Partial<DraftService>) =>
    setServicesDraft((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  const removeService = (idx: number) =>
    setServicesDraft((p) => p.filter((_, i) => i !== idx))

  const servicesTotal = useMemo(
    () => servicesDraft.reduce((acc, s) => acc + s.quantity * s.unitPrice, 0),
    [servicesDraft],
  )

  // ---------------- Submit ----------------
  const updateTooth = useUpdateTooth(odontogram?.id ?? '')
  const createEstimate = useCreateEstimate()
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!odontogram) {
      toast.error('Primero seleccioná un paciente')
      return
    }
    if (findingsDraft.length === 0 && servicesDraft.length === 0) {
      toast.info('Agregá al menos un hallazgo o un servicio')
      return
    }
    setSubmitting(true)
    try {
      // 1. Apply each finding sequentially so the backend's per-tooth history
      //    listener fires one entry per change (matches single-edit behavior).
      for (const f of findingsDraft) {
        await updateTooth.mutateAsync({
          fdiNumber: f.fdiNumber,
          data: {
            condition: f.condition,
            observation: f.note || undefined,
            historyNote: notes || f.note || undefined,
            treatmentStatus: 'PENDING',
          },
        })
      }

      // 2. Bundle all services into one estimate (DRAFT). The estimate links
      //    to the same patient so it shows up under "Presupuestos del paciente".
      if (servicesDraft.length > 0) {
        await createEstimate.mutateAsync({
          patientId: odontogram.patientId,
          notes: notes || undefined,
          items: servicesDraft.map((s) => ({
            treatmentId: s.treatmentId,
            fdiNumber: s.fdiNumber ?? undefined,
            quantity: s.quantity,
            unitPrice: s.unitPrice,
          })),
        })
      }

      toast.success('Tratamiento creado')
      router.push(`/odontograms/${odontogram.patientId}`)
    } catch (e) {
      // Individual hooks already surface their own toasts; nothing else to do here.
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------- Render ----------------
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/patients">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>

      <PageHeader
        title="Crear tratamiento"
        description="Seleccioná un paciente, aplicá hallazgos a uno o varios dientes y cargá los servicios a facturar"
      />

      {/* ============ Patient + header data ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del tratamiento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <FormField id="patient-search" label="Buscar paciente">
            <Input
              id="patient-search"
              placeholder="Nombre, DNI..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
          </FormField>
          <FormField id="patient" label="Paciente *" className="sm:col-span-2">
            <Select value={patientId || undefined} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {loadingPatients && (
                  <SelectItem value="loading" disabled>
                    Cargando...
                  </SelectItem>
                )}
                {patientsPage?.content.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullName} {p.documentNumber ? `· ${p.documentNumber}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="date" label="Fecha">
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <FormField id="dentition" label="Tipo de dentición">
            <Select value={dentition} onValueChange={(v) => setDentition(v as Dentition)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERMANENT">Permanente</SelectItem>
                <SelectItem value="PRIMARY">Temporal</SelectItem>
                <SelectItem value="MIXED">Mixta</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="doctor" label="Doctor">
            <Input
              id="doctor"
              value={user ? `${user.firstName} ${user.lastName ?? ''}` : ''}
              disabled
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ============ Patient summary card ============ */}
      {patient && (
        <Card>
          <CardContent className="grid gap-2 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Paciente</p>
              <p className="font-medium">{patient.fullName}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Documento</p>
              <p>{patient.documentNumber ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Teléfono</p>
              <p>{patient.phone ?? '-'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!patientId && (
        <LoadingState label="Seleccioná un paciente para continuar" variant="block" />
      )}

      {/* ============ Odontogram + palette ============ */}
      {patientId && getOrCreate.isPending && !odontogram && (
        <LoadingState label="Cargando odontograma..." variant="block" />
      )}

      {odontogram && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Aplicar hallazgos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Tocá los dientes para seleccionarlos (podés elegir varios), elegí el hallazgo
                y tocá <strong>Aplicar a seleccionados</strong>. Cada aplicación se agrega
                a la tabla de abajo.
              </p>
              <FindingPalette active={activeCondition} onChange={setActiveCondition} />
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <FormField id="bulk-note" label="Nota para los dientes seleccionados (opcional)">
                  <Input
                    id="bulk-note"
                    placeholder="Ej: cara oclusal con dolor"
                    value={bulkNote}
                    onChange={(e) => setBulkNote(e.target.value)}
                  />
                </FormField>
                <div className="flex items-end">
                  <Button onClick={applyFindingToSelected} disabled={selectedFdis.size === 0}>
                    <ChevronsRight className="h-4 w-4" />
                    Aplicar a seleccionados ({selectedFdis.size})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <OdontogramChart
            odontogram={odontogram}
            selectedFdis={selectedFdis}
            onSelectTooth={toggleTooth}
          />

          {/* ============ Draft: plan de tratamiento ============ */}
          <Card>
            <CardHeader>
              <CardTitle>Plan de tratamiento</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº diente</TableHead>
                    <TableHead>Hallazgo</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {findingsDraft.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <EmptyState
                          variant="row"
                          title="Sin hallazgos en el plan"
                          description="Aplicá un hallazgo desde el panel de arriba"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {findingsDraft.map((f, i) => (
                    <TableRow key={`${f.fdiNumber}-${f.condition}-${i}`}>
                      <TableCell className="font-mono">{f.fdiNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {TOOTH_CONDITION_LABEL[f.condition] ?? f.condition}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {f.note || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFindingDraft(i)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ============ Services (estimate items) ============ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Servicios</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Total: ${servicesTotal.toFixed(2)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <FormField id="service-search" label="Buscar tratamiento en el catálogo">
                  <Input
                    id="service-search"
                    placeholder="Código o nombre..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                  />
                </FormField>
                <div className="flex items-end">
                  <Select onValueChange={addServiceFromCatalog}>
                    <SelectTrigger className="w-72">
                      <SelectValue placeholder="Agregar tratamiento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCatalog && (
                        <SelectItem value="loading" disabled>
                          Cargando...
                        </SelectItem>
                      )}
                      {catalogPage?.content.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.code} — {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Pieza</TableHead>
                    <TableHead className="w-24">Cantidad</TableHead>
                    <TableHead className="w-32">Precio</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesDraft.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <EmptyState
                          variant="row"
                          icon={Plus}
                          title="Sin servicios"
                          description="Agregá un tratamiento desde el buscador"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {servicesDraft.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{s.treatmentCode}</TableCell>
                      <TableCell>{s.treatmentName}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={11}
                          max={85}
                          placeholder="-"
                          value={s.fdiNumber ?? ''}
                          onChange={(e) =>
                            updateService(i, {
                              fdiNumber: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={s.quantity}
                          onChange={(e) =>
                            updateService(i, { quantity: Math.max(1, Number(e.target.value)) })
                          }
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={s.unitPrice}
                          onChange={(e) =>
                            updateService(i, { unitPrice: Number(e.target.value) })
                          }
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell className="font-mono">
                        ${(s.quantity * s.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(i)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ============ Observations + submit ============ */}
          <Card>
            <CardHeader>
              <CardTitle>Observaciones generales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas que quedarán asociadas a cada hallazgo del plan"
              />
              <div className="flex justify-end">
                <Button onClick={submit} disabled={submitting} size="lg">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear tratamiento
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
