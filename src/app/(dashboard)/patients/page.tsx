import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { PatientList } from '@/features/patients/components/patient-list'

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description="Gestión de pacientes de la clínica"
        actions={
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="h-4 w-4" />
              Nuevo paciente
            </Link>
          </Button>
        }
      />
      <PatientList />
    </div>
  )
}
