'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Stethoscope, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InfoField } from '@/components/shared/info-field'
import { LoadingState } from '@/components/shared/loading-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { calculateAge, formatDate } from '@/lib/utils'
import { GENDER_LABEL } from '@/lib/constants'
import { PatientForm } from '@/features/patients/components/patient-form'
import {
  useActivatePatient,
  useDeactivatePatient,
  usePatient,
  useUpdatePatient,
} from '@/features/patients/hooks/use-patients'

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: patient, isLoading } = usePatient(id)
  const { mutate: update, isPending: isUpdating } = useUpdatePatient(id)
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivatePatient()
  const { mutate: activate } = useActivatePatient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isLoading) return <LoadingState />
  if (!patient) return <p className="text-muted-foreground">Paciente no encontrado</p>

  const age = calculateAge(patient.birthDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/patients">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/odontograms/${patient.id}`}>
            <Stethoscope className="h-4 w-4" /> Ver odontograma
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{patient.fullName}</CardTitle>
            {patient.active ? (
              <Badge variant="success">Activo</Badge>
            ) : (
              <Badge variant="secondary">Inactivo</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <InfoField label="DNI" value={patient.documentNumber} />
          <InfoField label="Edad" value={age !== null ? `${age} años` : null} />
          <InfoField label="Fecha nacimiento" value={formatDate(patient.birthDate)} />
          <InfoField label="Género" value={patient.gender ? GENDER_LABEL[patient.gender] : null} />
          <InfoField label="Teléfono" value={patient.phone} />
          <InfoField label="Email" value={patient.email} />
          <InfoField label="Obra social" value={patient.healthInsurance} />
          <InfoField label="N° afiliado" value={patient.insuranceNumber} />
          <InfoField label="Dirección" value={patient.address} className="sm:col-span-2" />
          <InfoField label="Antecedentes médicos" value={patient.medicalNotes} className="sm:col-span-2" />
          <InfoField label="Alergias" value={patient.allergies} className="sm:col-span-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar datos</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientForm
            initialValues={patient}
            isSubmitting={isUpdating}
            submitLabel="Guardar cambios"
            onSubmit={(values) => update(values)}
          />
          <div className="mt-4 flex justify-end gap-2">
            {patient.active ? (
              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="h-4 w-4" /> Desactivar paciente
              </Button>
            ) : (
              <Button variant="outline" onClick={() => activate(patient.id)}>
                Reactivar paciente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Desactivar paciente?"
        description={`${patient.fullName} dejará de aparecer en las búsquedas activas. Podés reactivarlo más tarde desde esta misma pantalla.`}
        variant="destructive"
        confirmLabel="Desactivar"
        loading={isDeactivating}
        onConfirm={() =>
          deactivate(patient.id, {
            onSuccess: () => setConfirmOpen(false),
          })
        }
      />
    </div>
  )
}
