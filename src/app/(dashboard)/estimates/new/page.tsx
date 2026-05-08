'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { FormField } from '@/components/shared/form-field'
import { LoadingState } from '@/components/shared/loading-state'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { EstimateForm } from '@/features/estimates/components/estimate-form'
import { useCreateEstimate } from '@/features/estimates/hooks/use-estimates'
import { usePatientsList } from '@/features/patients/hooks/use-patients'

export default function NewEstimatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetPatientId = searchParams.get('patientId') ?? ''

  const [search, setSearch] = useState('')
  const [patientId, setPatientId] = useState(presetPatientId)
  const debounced = useDebouncedValue(search, 300)
  const { data: patients, isLoading: loadingPatients } = usePatientsList({ search: debounced, size: 50 })
  const create = useCreateEstimate()

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/estimates">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>

      <PageHeader
        title="Nuevo presupuesto"
        description="Generá un presupuesto seleccionando los tratamientos del catálogo"
      />

      <Card>
        <CardHeader>
          <CardTitle>Paciente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FormField id="patient-search" label="Buscar paciente">
            <input
              id="patient-search"
              placeholder="Nombre, DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </FormField>
          <FormField id="patient" label="Paciente">
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
                {patients?.content.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullName} {p.documentNumber ? `· ${p.documentNumber}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      {patientId ? (
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <EstimateForm
              patientId={patientId}
              isSubmitting={create.isPending}
              submitLabel="Crear presupuesto"
              onSubmit={(values) =>
                create.mutate(values, {
                  onSuccess: (r) => router.push(`/estimates/${r.data.id}`),
                })
              }
            />
          </CardContent>
        </Card>
      ) : (
        <LoadingState label="Seleccioná un paciente para continuar" variant="block" />
      )}
    </div>
  )
}
