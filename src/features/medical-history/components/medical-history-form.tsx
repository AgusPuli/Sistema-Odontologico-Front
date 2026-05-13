'use client'
import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/form-field'
import { formatDate } from '@/lib/utils'
import {
  ASA_LABEL,
  BLOOD_TYPE_LABEL,
  FLOSSING_LABEL,
} from '../config/labels'
import { useMedicalHistory, useUpsertMedicalHistory } from '../hooks/use-medical-history'
import type {
  AsaClassification,
  BloodType,
  FlossingFrequency,
  MedicalHistory,
  MedicalHistoryRequest,
} from '../types/medical-history.types'

interface Props {
  patientId: string
}

/**
 * Anamnesis form. Sections:
 *  1. ASA + tipo sanguíneo
 *  2. Antecedentes médicos (condiciones crónicas con notas)
 *  3. Alergias
 *  4. Medicación actual
 *  5. Hábitos
 *  6. Ginecológico (mostrar solo si "Mujer" — el form no sabe, así que siempre lo muestra plegable)
 *  7. Antecedentes odontológicos / hábitos higiene
 *  8. Signos vitales
 *  9. Observaciones
 *
 * Estado controlado por el componente. En cada cambio escribe en un buffer
 * local; al "Guardar" envía el buffer completo (el back hace patch).
 */
export function MedicalHistoryForm({ patientId }: Props) {
  const { data, isLoading } = useMedicalHistory(patientId)
  const { mutate, isPending } = useUpsertMedicalHistory(patientId)
  const [form, setForm] = useState<MedicalHistoryRequest>({})

  // Seed the local buffer from the server payload when it arrives
  useEffect(() => {
    if (!data) return
    setForm(stripServerOnlyFields(data))
  }, [data])

  if (isLoading) return <p className="text-muted-foreground">Cargando historia clínica...</p>

  const update = <K extends keyof MedicalHistoryRequest>(key: K, value: MedicalHistoryRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => mutate(form)

  return (
    <div className="space-y-6">
      {data?.lastReviewedAt && (
        <p className="text-xs text-muted-foreground">
          Última revisión: {formatDate(data.lastReviewedAt, true)}{' '}
          {data.updatedBy ? `· ${data.updatedBy}` : ''}
        </p>
      )}

      {/* ============ 1. Datos generales ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FormField id="asa" label="Clasificación ASA (riesgo anestésico)">
            <Select
              value={form.asaClassification ?? 'none'}
              onValueChange={(v) =>
                update('asaClassification', v === 'none' ? null : (v as AsaClassification))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin determinar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin determinar</SelectItem>
                {(Object.keys(ASA_LABEL) as AsaClassification[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {ASA_LABEL[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="blood" label="Tipo sanguíneo">
            <Select
              value={form.bloodType ?? 'none'}
              onValueChange={(v) => update('bloodType', v === 'none' ? null : (v as BloodType))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin determinar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin determinar</SelectItem>
                {(Object.keys(BLOOD_TYPE_LABEL) as BloodType[]).map((b) => (
                  <SelectItem key={b} value={b}>
                    {BLOOD_TYPE_LABEL[b]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="complaint" label="Motivo de consulta" className="sm:col-span-2">
            <Textarea
              id="complaint"
              rows={2}
              value={form.chiefComplaint ?? ''}
              onChange={(e) => update('chiefComplaint', e.target.value)}
              placeholder="Lo que motivó la consulta inicial"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ============ 2. Antecedentes médicos ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Antecedentes médicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ConditionWithNotes
            id="diabetes"
            label="Diabetes"
            checked={!!form.diabetes}
            notes={form.diabetesNotes ?? ''}
            onCheckedChange={(v) => update('diabetes', v)}
            onNotesChange={(v) => update('diabetesNotes', v)}
          />
          <ConditionWithNotes
            id="htn"
            label="Hipertensión arterial"
            checked={!!form.hypertension}
            notes={form.hypertensionNotes ?? ''}
            onCheckedChange={(v) => update('hypertension', v)}
            onNotesChange={(v) => update('hypertensionNotes', v)}
          />
          <ConditionWithNotes
            id="heart"
            label="Cardiopatía"
            checked={!!form.heartDisease}
            notes={form.heartDiseaseNotes ?? ''}
            onCheckedChange={(v) => update('heartDisease', v)}
            onNotesChange={(v) => update('heartDiseaseNotes', v)}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <BoolField label="Enfermedad renal" checked={!!form.kidneyDisease} onChange={(v) => update('kidneyDisease', v)} />
            <BoolField label="Enfermedad hepática" checked={!!form.liverDisease} onChange={(v) => update('liverDisease', v)} />
            <BoolField label="Enfermedad respiratoria (asma, EPOC)" checked={!!form.respiratoryDisease} onChange={(v) => update('respiratoryDisease', v)} />
            <BoolField label="Tiroides" checked={!!form.thyroidDisease} onChange={(v) => update('thyroidDisease', v)} />
            <BoolField label="Cáncer / antecedente oncológico" checked={!!form.cancer} onChange={(v) => update('cancer', v)} />
            <BoolField label="Trastorno de coagulación" checked={!!form.bleedingDisorder} onChange={(v) => update('bleedingDisorder', v)} />
            <BoolField label="Toma anticoagulantes" checked={!!form.anticoagulantUse} onChange={(v) => update('anticoagulantUse', v)} />
            <BoolField label="Epilepsia" checked={!!form.epilepsy} onChange={(v) => update('epilepsy', v)} />
            <BoolField label="Trastornos psiquiátricos" checked={!!form.psychiatricCondition} onChange={(v) => update('psychiatricCondition', v)} />
          </div>
          <FormField id="other" label="Otras condiciones / notas generales">
            <Textarea
              id="other"
              rows={3}
              value={form.otherConditions ?? ''}
              onChange={(e) => update('otherConditions', e.target.value)}
              placeholder="Embarazo de riesgo previo, hospitalizaciones recientes, etc."
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ============ 3. Alergias ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Alergias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <BoolField label="Penicilina / antibióticos" checked={!!form.allergyPenicillin} onChange={(v) => update('allergyPenicillin', v)} />
            <BoolField label="Látex" checked={!!form.allergyLatex} onChange={(v) => update('allergyLatex', v)} />
            <BoolField label="Anestésicos" checked={!!form.allergyAnesthesia} onChange={(v) => update('allergyAnesthesia', v)} />
          </div>
          <FormField id="allergy-other" label="Otras alergias (medicamentos, materiales, etc.)">
            <Textarea
              id="allergy-other"
              rows={2}
              value={form.allergyOther ?? ''}
              onChange={(e) => update('allergyOther', e.target.value)}
              placeholder="Ej: AINEs, níquel, sulfas..."
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ============ 4. Medicación ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Medicación actual</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField id="meds" label="Listado de medicamentos en uso">
            <Textarea
              id="meds"
              rows={3}
              value={form.currentMedications ?? ''}
              onChange={(e) => update('currentMedications', e.target.value)}
              placeholder="Ej: Enalapril 10mg/d, Metformina 850mg c/12hs, Aspirina 100mg/d"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ============ 5. Hábitos ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <BoolField label="Fumador/a" checked={!!form.smoker} onChange={(v) => update('smoker', v)} />
              {form.smoker && (
                <FormField id="smoking" label="Cantidad / desde cuándo" className="mt-2">
                  <Input
                    id="smoking"
                    value={form.smokingDetails ?? ''}
                    onChange={(e) => update('smokingDetails', e.target.value)}
                    placeholder="Ej: 10/día desde hace 5 años"
                  />
                </FormField>
              )}
            </div>
            <div>
              <BoolField label="Consume alcohol" checked={!!form.alcohol} onChange={(v) => update('alcohol', v)} />
              {form.alcohol && (
                <FormField id="alcohol-details" label="Frecuencia" className="mt-2">
                  <Input
                    id="alcohol-details"
                    value={form.alcoholDetails ?? ''}
                    onChange={(e) => update('alcoholDetails', e.target.value)}
                    placeholder="Ej: ocasional / fin de semana"
                  />
                </FormField>
              )}
            </div>
          </div>
          <BoolField label="Bruxismo / rechinar de dientes" checked={!!form.bruxism} onChange={(v) => update('bruxism', v)} />
        </CardContent>
      </Card>

      {/* ============ 6. Femenino ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Femenino</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <BoolField label="Embarazada" checked={!!form.pregnant} onChange={(v) => update('pregnant', v)} />
            {form.pregnant && (
              <FormField id="weeks" label="Semanas de gestación">
                <Input
                  id="weeks"
                  type="number"
                  min={0}
                  max={45}
                  value={form.pregnancyWeeks ?? ''}
                  onChange={(e) => update('pregnancyWeeks', e.target.value ? Number(e.target.value) : null)}
                />
              </FormField>
            )}
            <BoolField label="Lactancia" checked={!!form.breastfeeding} onChange={(v) => update('breastfeeding', v)} />
          </div>
        </CardContent>
      </Card>

      {/* ============ 7. Antecedentes odontológicos ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Antecedentes odontológicos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FormField id="last-visit" label="Última consulta odontológica">
            <Input
              id="last-visit"
              type="date"
              value={form.lastDentalVisit ?? ''}
              onChange={(e) => update('lastDentalVisit', e.target.value || null)}
            />
          </FormField>
          <FormField id="brushing" label="Cepillados por día">
            <Input
              id="brushing"
              type="number"
              min={0}
              max={10}
              value={form.brushingPerDay ?? ''}
              onChange={(e) => update('brushingPerDay', e.target.value ? Number(e.target.value) : null)}
            />
          </FormField>
          <FormField id="flossing" label="Uso de hilo dental">
            <Select
              value={form.flossingFrequency ?? 'none'}
              onValueChange={(v) =>
                update('flossingFrequency', v === 'none' ? null : (v as FlossingFrequency))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin determinar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin determinar</SelectItem>
                {(Object.keys(FLOSSING_LABEL) as FlossingFrequency[]).map((f) => (
                  <SelectItem key={f} value={f}>
                    {FLOSSING_LABEL[f]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="dental-problems" label="Problemas odontológicos previos" className="sm:col-span-2">
            <Textarea
              id="dental-problems"
              rows={3}
              value={form.previousDentalProblems ?? ''}
              onChange={(e) => update('previousDentalProblems', e.target.value)}
              placeholder="Ej: extracciones previas, endodoncias, problemas de ATM..."
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ============ 8. Signos vitales ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Signos vitales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <FormField id="bp-sys" label="Presión sistólica (mmHg)">
            <Input
              id="bp-sys"
              type="number"
              value={form.bloodPressureSystolic ?? ''}
              onChange={(e) => update('bloodPressureSystolic', e.target.value ? Number(e.target.value) : null)}
              placeholder="120"
            />
          </FormField>
          <FormField id="bp-dia" label="Presión diastólica (mmHg)">
            <Input
              id="bp-dia"
              type="number"
              value={form.bloodPressureDiastolic ?? ''}
              onChange={(e) => update('bloodPressureDiastolic', e.target.value ? Number(e.target.value) : null)}
              placeholder="80"
            />
          </FormField>
          <FormField id="hr" label="Frecuencia cardíaca (lpm)">
            <Input
              id="hr"
              type="number"
              value={form.heartRate ?? ''}
              onChange={(e) => update('heartRate', e.target.value ? Number(e.target.value) : null)}
              placeholder="75"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ============ 9. Observaciones ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones generales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={form.generalObservations ?? ''}
            onChange={(e) => update('generalObservations', e.target.value)}
            placeholder="Notas adicionales que no entren en las secciones anteriores"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} size="lg">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar historia clínica
        </Button>
      </div>
    </div>
  )
}

// ============ Helpers ============

function BoolField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <span>{label}</span>
    </label>
  )
}

function ConditionWithNotes({
  id,
  label,
  checked,
  notes,
  onCheckedChange,
  onNotesChange,
}: {
  id: string
  label: string
  checked: boolean
  notes: string
  onCheckedChange: (v: boolean) => void
  onNotesChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <BoolField label={label} checked={checked} onChange={onCheckedChange} />
      {checked && (
        <FormField id={id} label="Notas" className="ml-6">
          <Input
            id={id}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={`Ej: ${label.toLowerCase()} controlada con medicación`}
          />
        </FormField>
      )}
    </div>
  )
}

/**
 * Drops fields the server owns (id, audit, last-reviewed) so we don't echo them back.
 */
function stripServerOnlyFields(data: MedicalHistory): MedicalHistoryRequest {
  const { id, tenantId, patientId, lastReviewedAt, createdAt, updatedAt, updatedBy, ...rest } = data
  return rest
}
