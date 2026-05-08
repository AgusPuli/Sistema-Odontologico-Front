'use client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientForm } from '@/features/patients/components/patient-form'
import { useCreatePatient } from '@/features/patients/hooks/use-patients'

export default function NewPatientPage() {
  const router = useRouter()
  const { mutate, isPending } = useCreatePatient()
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Nuevo paciente</h1>
        <p className="text-muted-foreground">Registrá los datos básicos del paciente</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Datos del paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientForm
            isSubmitting={isPending}
            submitLabel="Crear paciente"
            onSubmit={(values) =>
              mutate(values, {
                onSuccess: (r) => router.push(`/patients/${r.data.id}`),
              })
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
