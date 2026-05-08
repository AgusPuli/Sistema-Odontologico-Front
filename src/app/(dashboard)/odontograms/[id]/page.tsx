'use client'
import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { OdontogramChart } from '@/features/odontogram/components/odontogram-chart'
import { ToothEditDialog } from '@/features/odontogram/components/tooth-edit-dialog'
import { TreatmentPlanTable } from '@/features/odontogram/components/treatment-plan-table'
import { ConditionLegend } from '@/features/odontogram/components/condition-legend'
import {
  useCreateOdontogram,
  useCurrentOdontogram,
} from '@/features/odontogram/hooks/use-odontogram'
import { usePatient } from '@/features/patients/hooks/use-patients'
import type { Dentition } from '@/features/odontogram/types/odontogram.types'

/**
 * Route param `id` is the **patientId**. We resolve the patient's current odontogram;
 * if there's none we offer to create one (PERMANENT/PRIMARY/MIXED).
 */
export default function PatientOdontogramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params)
  const { data: patient } = usePatient(patientId)
  const { data: odontogram, isLoading } = useCurrentOdontogram(patientId)
  const create = useCreateOdontogram()

  const [selectedFdi, setSelectedFdi] = useState<number | null>(null)
  const [pendingDentition, setPendingDentition] = useState<Dentition>('PERMANENT')

  const selectedTooth = useMemo(
    () => odontogram?.teeth.find((t) => t.fdiNumber === selectedFdi),
    [odontogram, selectedFdi]
  )

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/patients/${patientId}`}>
            <ArrowLeft className="h-4 w-4" /> Volver al paciente
          </Link>
        </Button>
        {patient && (
          <div className="text-right text-sm">
            <p className="font-medium">{patient.fullName}</p>
            <p className="text-muted-foreground">{patient.documentNumber || 'Sin DNI'}</p>
          </div>
        )}
      </div>

      {!odontogram && (
        <Card>
          <CardHeader>
            <CardTitle>Este paciente todavía no tiene odontograma</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <Label>Tipo de dentición</Label>
              <Select value={pendingDentition} onValueChange={(v) => setPendingDentition(v as Dentition)}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERMANENT">Permanente (adulto)</SelectItem>
                  <SelectItem value="PRIMARY">Temporal (pediátrico)</SelectItem>
                  <SelectItem value="MIXED">Mixta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() =>
                create.mutate({ patientId, dentition: pendingDentition })
              }
              disabled={create.isPending}
            >
              {create.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Crear odontograma
            </Button>
          </CardContent>
        </Card>
      )}

      {odontogram && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Odontograma —{' '}
                  {odontogram.dentition === 'PERMANENT'
                    ? 'Permanente'
                    : odontogram.dentition === 'PRIMARY'
                      ? 'Temporal'
                      : 'Mixta'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ConditionLegend />
            </CardContent>
          </Card>

          <OdontogramChart
            odontogram={odontogram}
            selectedFdi={selectedFdi}
            onSelectTooth={(fdi) => setSelectedFdi(fdi)}
          />

          <TreatmentPlanTable odontogramId={odontogram.id} />

          <ToothEditDialog
            open={selectedFdi != null}
            onClose={() => setSelectedFdi(null)}
            odontogramId={odontogram.id}
            fdi={selectedFdi}
            tooth={selectedTooth}
          />
        </>
      )}
    </div>
  )
}
