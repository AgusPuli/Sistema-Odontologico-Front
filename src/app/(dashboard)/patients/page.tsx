import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PatientList } from '@/features/patients/components/patient-list'

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">Gestión de pacientes de la clínica</p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <Plus className="h-4 w-4" />
            Nuevo paciente
          </Link>
        </Button>
      </div>
      <PatientList />
    </div>
  )
}
