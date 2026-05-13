'use client'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ClinicalSessionForm } from '@/features/clinical-sessions/components/clinical-session-form'
import {
  useClinicalSession,
  useUpdateClinicalSession,
} from '@/features/clinical-sessions/hooks/use-clinical-session'

/**
 * /clinical-sessions/[id] — edit an existing clinical session.
 * Pre-fills the form from the server payload, then issues a PUT on save.
 */
export default function ClinicalSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: session, isLoading } = useClinicalSession(id)
  const update = useUpdateClinicalSession(id)

  if (isLoading) return <LoadingState />
  if (!session) return <p className="text-muted-foreground">Sesión no encontrada</p>

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/patients/${session.patientId}`}>
          <ArrowLeft className="h-4 w-4" /> Volver al paciente
        </Link>
      </Button>

      <PageHeader
        title={`Sesión clínica · ${session.patientFullName ?? '-'}`}
        description={`Atendido por ${session.dentistFullName ?? '-'}`}
      />

      <ClinicalSessionForm
        patientId={session.patientId}
        initial={{
          sessionDate: session.sessionDate,
          durationMinutes: session.durationMinutes ?? undefined,
          bloodPressureSystolic: session.bloodPressureSystolic ?? undefined,
          bloodPressureDiastolic: session.bloodPressureDiastolic ?? undefined,
          heartRate: session.heartRate ?? undefined,
          subjective: session.subjective ?? '',
          objective: session.objective ?? '',
          assessment: session.assessment ?? '',
          plan: session.plan ?? '',
          anesthesiaUsed: session.anesthesiaUsed,
          anesthesiaType: session.anesthesiaType ?? '',
          anesthesiaDoses: session.anesthesiaDoses ?? undefined,
          materialsUsed: session.materialsUsed ?? '',
          generalNotes: session.generalNotes ?? '',
          nextAppointmentRecommendation: session.nextAppointmentRecommendation ?? '',
          status: session.status,
          procedures: session.procedures.map((p) => ({
            treatmentId: p.treatmentId,
            treatmentCode: p.treatmentCode,
            treatmentName: p.treatmentName,
            fdiNumber: p.fdiNumber,
            notes: p.notes ?? '',
          })),
        }}
        submitLabel="Guardar cambios"
        isSubmitting={update.isPending}
        onSubmit={(values) => {
          // Strip patientId (immutable on update) before sending
          const { patientId: _p, ...rest } = values
          update.mutate(rest)
        }}
      />
    </div>
  )
}
