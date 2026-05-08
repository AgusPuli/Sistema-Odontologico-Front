'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingState } from '@/components/shared/loading-state'
import { InfoField } from '@/components/shared/info-field'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useRouter } from 'next/navigation'
import { ESTIMATE_STATUS_LABEL } from '@/lib/constants'
import { formatDate, formatMoney } from '@/lib/utils'
import { EstimateForm } from '@/features/estimates/components/estimate-form'
import {
  useChangeEstimateStatus,
  useDeleteEstimate,
  useEstimate,
  useUpdateEstimate,
} from '@/features/estimates/hooks/use-estimates'
import type { EstimateStatus } from '@/features/estimates/types/estimate.types'

const STATUSES: EstimateStatus[] = [
  'DRAFT',
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
]

export default function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: estimate, isLoading } = useEstimate(id)
  const updateMut = useUpdateEstimate(id)
  const changeStatus = useChangeEstimateStatus()
  const deleteMut = useDeleteEstimate()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  if (isLoading) return <LoadingState />
  if (!estimate) return <p className="text-muted-foreground">Presupuesto no encontrado</p>

  const editable = estimate.status !== 'ACCEPTED' && estimate.status !== 'CANCELLED'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/estimates">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirmDeleteOpen(true)}
          disabled={estimate.status === 'ACCEPTED'}
        >
          <Trash2 className="h-4 w-4" /> Eliminar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Presupuesto · {estimate.patientFullName ?? 'Paciente'}
            </CardTitle>
            <Badge variant="outline">{ESTIMATE_STATUS_LABEL[estimate.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <InfoField label="Fecha emisión" value={formatDate(estimate.issueDate)} />
          <InfoField label="Vence" value={formatDate(estimate.validUntil)} />
          <InfoField label="Total" value={formatMoney(estimate.total)} />
          <InfoField label="Items" value={estimate.items.length} />
          <InfoField label="Notas" value={estimate.notes} className="sm:col-span-2" />

          <div className="sm:col-span-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Cambiar estado
            </p>
            <Select
              value={estimate.status}
              onValueChange={(v) =>
                changeStatus.mutate({ id: estimate.id, status: v as EstimateStatus })
              }
            >
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ESTIMATE_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {editable && (
        <Card>
          <CardHeader>
            <CardTitle>Editar items</CardTitle>
          </CardHeader>
          <CardContent>
            <EstimateForm
              patientId={estimate.patientId}
              initialValues={estimate}
              isSubmitting={updateMut.isPending}
              submitLabel="Guardar cambios"
              onSubmit={(values) => updateMut.mutate(values)}
            />
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="¿Eliminar presupuesto?"
        description="Esta acción no se puede deshacer. Si el presupuesto fue aceptado, cancelalo en lugar de eliminarlo."
        variant="destructive"
        confirmLabel="Eliminar"
        loading={deleteMut.isPending}
        onConfirm={() =>
          deleteMut.mutate(estimate.id, {
            onSuccess: () => {
              setConfirmDeleteOpen(false)
              router.push('/estimates')
            },
          })
        }
      />
    </div>
  )
}
