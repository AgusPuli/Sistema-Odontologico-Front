'use client'
import { useState } from 'react'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { FormField } from '@/components/shared/form-field'
import { EmptyState } from '@/components/shared/empty-state'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useTreatmentsSearch } from '@/features/treatments/hooks/use-treatments'
import type {
  ClinicalSessionStatus,
  CreateClinicalSessionRequest,
  SessionProcedureRequest,
} from '../types/clinical-session.types'

interface DraftProcedure extends SessionProcedureRequest {
  treatmentCode: string
  treatmentName: string
}

interface Props {
  patientId: string
  /** When editing, pass the existing record so the form starts pre-filled. */
  initial?: Partial<CreateClinicalSessionRequest> & { procedures?: DraftProcedure[] }
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (values: CreateClinicalSessionRequest) => void
}

/**
 * Form to create or edit a clinical session. SOAP notes + vital signs +
 * anesthesia + materials + procedures performed.
 *
 * The procedures table reuses the same UX as the "Crear tratamiento" page:
 * search the treatment catalog, pick one, optionally tag a tooth.
 */
export function ClinicalSessionForm({
  patientId,
  initial,
  submitLabel,
  isSubmitting,
  onSubmit,
}: Props) {
  const { user } = useAuth()

  const [sessionDate, setSessionDate] = useState(
    initial?.sessionDate ?? new Date().toISOString().slice(0, 16),
  )
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(
    initial?.durationMinutes,
  )

  const [bpSys, setBpSys] = useState<number | undefined>(initial?.bloodPressureSystolic)
  const [bpDia, setBpDia] = useState<number | undefined>(initial?.bloodPressureDiastolic)
  const [hr, setHr] = useState<number | undefined>(initial?.heartRate)

  const [subjective, setSubjective] = useState(initial?.subjective ?? '')
  const [objective, setObjective] = useState(initial?.objective ?? '')
  const [assessment, setAssessment] = useState(initial?.assessment ?? '')
  const [plan, setPlan] = useState(initial?.plan ?? '')

  const [anesthesiaUsed, setAnesthesiaUsed] = useState(initial?.anesthesiaUsed ?? false)
  const [anesthesiaType, setAnesthesiaType] = useState(initial?.anesthesiaType ?? '')
  const [anesthesiaDoses, setAnesthesiaDoses] = useState<number | undefined>(
    initial?.anesthesiaDoses,
  )

  const [materialsUsed, setMaterialsUsed] = useState(initial?.materialsUsed ?? '')
  const [generalNotes, setGeneralNotes] = useState(initial?.generalNotes ?? '')
  const [nextRecommendation, setNextRecommendation] = useState(
    initial?.nextAppointmentRecommendation ?? '',
  )
  const [status, setStatus] = useState<ClinicalSessionStatus>(initial?.status ?? 'DRAFT')

  const [procedures, setProcedures] = useState<DraftProcedure[]>(initial?.procedures ?? [])

  // Procedure picker
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 300)
  const { data: catalog } = useTreatmentsSearch({
    specialty: user?.specialty ?? undefined,
    search: debounced,
    size: 20,
  })

  const addProcedure = (treatmentId: string) => {
    const t = catalog?.content.find((x) => x.id === treatmentId)
    if (!t) return
    setProcedures((prev) => [
      ...prev,
      {
        treatmentId: t.id,
        treatmentCode: t.code,
        treatmentName: t.name,
        fdiNumber: null,
        notes: '',
      },
    ])
  }

  const updateProcedure = (idx: number, patch: Partial<DraftProcedure>) =>
    setProcedures((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))

  const removeProcedure = (idx: number) =>
    setProcedures((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = () => {
    onSubmit({
      patientId,
      sessionDate,
      durationMinutes,
      bloodPressureSystolic: bpSys,
      bloodPressureDiastolic: bpDia,
      heartRate: hr,
      subjective,
      objective,
      assessment,
      plan,
      anesthesiaUsed,
      anesthesiaType: anesthesiaUsed ? anesthesiaType : undefined,
      anesthesiaDoses: anesthesiaUsed ? anesthesiaDoses : undefined,
      materialsUsed,
      generalNotes,
      nextAppointmentRecommendation: nextRecommendation,
      status,
      procedures: procedures.map((p) => ({
        treatmentId: p.treatmentId,
        fdiNumber: p.fdiNumber ?? undefined,
        notes: p.notes,
      })),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la sesión</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <FormField id="date" label="Fecha y hora">
            <Input
              id="date"
              type="datetime-local"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </FormField>
          <FormField id="duration" label="Duración (min)">
            <Input
              id="duration"
              type="number"
              min={0}
              value={durationMinutes ?? ''}
              onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : undefined)}
            />
          </FormField>
          <FormField id="status" label="Estado">
            <Select value={status} onValueChange={(v) => setStatus(v as ClinicalSessionStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="COMPLETED">Completada</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      {/* Signos vitales */}
      <Card>
        <CardHeader>
          <CardTitle>Signos vitales al inicio</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <FormField id="bp-sys" label="TA sistólica (mmHg)">
            <Input
              id="bp-sys"
              type="number"
              value={bpSys ?? ''}
              onChange={(e) => setBpSys(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="120"
            />
          </FormField>
          <FormField id="bp-dia" label="TA diastólica (mmHg)">
            <Input
              id="bp-dia"
              type="number"
              value={bpDia ?? ''}
              onChange={(e) => setBpDia(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="80"
            />
          </FormField>
          <FormField id="hr" label="Frecuencia cardíaca (lpm)">
            <Input
              id="hr"
              type="number"
              value={hr ?? ''}
              onChange={(e) => setHr(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="75"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* SOAP */}
      <Card>
        <CardHeader>
          <CardTitle>Notas clínicas (SOAP)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FormField id="subjective" label="S — Subjetivo (relato del paciente)">
            <Textarea
              id="subjective"
              rows={3}
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="Ej: dolor al frío en cuadrante superior derecho hace 1 semana"
            />
          </FormField>
          <FormField id="objective" label="O — Objetivo (examen / hallazgos)">
            <Textarea
              id="objective"
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ej: caries oclusal pieza 16, prueba térmica positiva"
            />
          </FormField>
          <FormField id="assessment" label="A — Análisis / diagnóstico">
            <Textarea
              id="assessment"
              rows={3}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Ej: pulpitis reversible en pieza 16"
            />
          </FormField>
          <FormField id="plan" label="P — Plan / conducta">
            <Textarea
              id="plan"
              rows={3}
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Ej: obturación con resina, control en 7 días"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Procedimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Procedimientos realizados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <FormField id="proc-search" label="Buscar en el catálogo">
              <Input
                id="proc-search"
                placeholder="Código o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </FormField>
            <div className="flex items-end">
              <Select onValueChange={addProcedure}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Agregar procedimiento..." />
                </SelectTrigger>
                <SelectContent>
                  {catalog?.content.map((t) => (
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
                <TableHead>Procedimiento</TableHead>
                <TableHead>Pieza</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedures.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      variant="row"
                      icon={Plus}
                      title="Sin procedimientos"
                      description="Agregá lo que hiciste durante la sesión"
                    />
                  </TableCell>
                </TableRow>
              )}
              {procedures.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{p.treatmentCode}</TableCell>
                  <TableCell>{p.treatmentName}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={11}
                      max={85}
                      placeholder="-"
                      value={p.fdiNumber ?? ''}
                      onChange={(e) =>
                        updateProcedure(i, {
                          fdiNumber: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={p.notes ?? ''}
                      onChange={(e) => updateProcedure(i, { notes: e.target.value })}
                      placeholder="Detalle"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProcedure(i)}
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

      {/* Anestesia */}
      <Card>
        <CardHeader>
          <CardTitle>Anestesia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={anesthesiaUsed}
              onCheckedChange={(v) => setAnesthesiaUsed(v === true)}
            />
            <span>Se usó anestesia</span>
          </label>
          {anesthesiaUsed && (
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="anesth-type" label="Tipo (carpule, marca)">
                <Input
                  id="anesth-type"
                  value={anesthesiaType}
                  onChange={(e) => setAnesthesiaType(e.target.value)}
                  placeholder="Ej: Carbocaína 2% con epinefrina"
                />
              </FormField>
              <FormField id="anesth-doses" label="Carpules / dosis">
                <Input
                  id="anesth-doses"
                  type="number"
                  min={0}
                  value={anesthesiaDoses ?? ''}
                  onChange={(e) =>
                    setAnesthesiaDoses(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </FormField>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materiales + Notas + Próxima */}
      <Card>
        <CardHeader>
          <CardTitle>Materiales y observaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FormField id="materials" label="Materiales utilizados">
            <Textarea
              id="materials"
              rows={2}
              value={materialsUsed}
              onChange={(e) => setMaterialsUsed(e.target.value)}
              placeholder="Ej: Resina A2 Filtek Z350, ácido grabador, adhesivo single bond..."
            />
          </FormField>
          <FormField id="general-notes" label="Notas generales">
            <Textarea
              id="general-notes"
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </FormField>
          <FormField id="next" label="Plan para próxima sesión">
            <Textarea
              id="next"
              rows={2}
              value={nextRecommendation}
              onChange={(e) => setNextRecommendation(e.target.value)}
              placeholder="Ej: control en 7 días, continuar con endodoncia"
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
