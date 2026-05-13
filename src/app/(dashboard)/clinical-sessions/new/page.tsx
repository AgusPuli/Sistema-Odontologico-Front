'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import { FormField } from '@/components/shared/form-field'
import { LoadingState } from '@/components/shared/loading-state'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { usePatient, usePatientsList } from '@/features/patients/hooks/use-patients'
import { ClinicalSessionForm } from '@/features/clinical-sessions/components/clinical-session-form'
import { useCreateClinicalSession } from '@/features/clinical-sessions/hooks/use-clinical-session'

/**
 * /clinical-sessions/new — pick a patient (or land here with ?patientId=…)
 * and fill the SOAP form.
 */
export default function NewClinicalSessionPage() {
  const router = useRouter()
  const params = useSearchParams()
  const presetPatientId = params.get('patientId') ?? ''

  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 300)
  const { data: patientsPage, isLoading: loadingPatients } = usePatientsList({
    search: debounced,
    size: 30,
  })
  const [patientId, setPatientId] = useState(presetPatientId)
  const { data: patient } = usePatient(patientId || undefined)
  const create = useCreateClinicalSession()

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={patientId ? `/patients/${patientId}` : '/patients'}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>

      <PageHeader
        title="Nueva sesión clínica"
        description="Registrá lo que pasó en el turno: SOAP, procedimientos realizados, anestesia, materiales"
      />

      <Card>
        <CardHeader>
          <CardTitle>Paciente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FormField id="search" label="Buscar">
            <Input
              id="search"
              placeholder="Nombre, DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FormField>
          <FormField id="patient" label="Paciente *">
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
        </CardContent>
      </Card>

      {!patientId && (
        <LoadingState label="Seleccioná un paciente para continuar" variant="block" />
      )}

      {patientId && patient && (
        <ClinicalSessionForm
          patientId={patientId}
          submitLabel="Crear sesión"
          isSubmitting={create.isPending}
          onSubmit={(values) =>
            create.mutate(values, {
              onSuccess: (r) => router.push(`/clinical-sessions/${r.data.id}`),
            })
          }
        />
      )}
    </div>
  )
}
