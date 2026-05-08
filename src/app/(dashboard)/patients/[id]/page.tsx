'use client'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  const { mutate: deactivate } = useDeactivatePatient()
  const { mutate: activate } = useActivatePatient()

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>
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
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <Info label="DNI" value={patient.documentNumber} />
          <Info label="Edad" value={age !== null ? `${age} años` : null} />
          <Info label="Fecha nacimiento" value={formatDate(patient.birthDate)} />
          <Info label="Género" value={patient.gender ? GENDER_LABEL[patient.gender] : null} />
          <Info label="Teléfono" value={patient.phone} />
          <Info label="Email" value={patient.email} />
          <Info label="Obra social" value={patient.healthInsurance} />
          <Info label="N° afiliado" value={patient.insuranceNumber} />
          <div className="sm:col-span-2">
            <Info label="Dirección" value={patient.address} />
          </div>
          <div className="sm:col-span-2">
            <Info label="Antecedentes médicos" value={patient.medicalNotes} />
          </div>
          <div className="sm:col-span-2">
            <Info label="Alergias" value={patient.allergies} />
          </div>
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
          <div className="mt-4 flex justify-end">
            {patient.active ? (
              <Button variant="outline" onClick={() => deactivate(patient.id)}>
                Desactivar paciente
              </Button>
            ) : (
              <Button variant="outline" onClick={() => activate(patient.id)}>
                Reactivar paciente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p>{value || '-'}</p>
    </div>
  )
}
