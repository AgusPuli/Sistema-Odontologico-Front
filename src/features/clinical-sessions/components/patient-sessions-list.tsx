'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ClipboardList, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState } from '@/components/shared/loading-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { formatDate } from '@/lib/utils'
import {
  useClinicalSessionsByPatient,
  useDeleteClinicalSession,
} from '../hooks/use-clinical-session'
import { SESSION_STATUS_LABEL, SESSION_STATUS_VARIANT } from '../config/labels'

interface Props {
  patientId: string
}

/**
 * Table of clinical sessions for a patient, with primary CTA to create a new
 * one and per-row actions to edit / delete.
 */
export function PatientSessionsList({ patientId }: Props) {
  const { data, isLoading } = useClinicalSessionsByPatient(patientId)
  const del = useDeleteClinicalSession()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/clinical-sessions/new?patientId=${patientId}`}>
            <PlusCircle className="h-4 w-4" /> Nueva sesión
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Procedimientos</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LoadingState variant="row" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      variant="row"
                      icon={ClipboardList}
                      title="Sin sesiones clínicas registradas"
                      description="Cada turno realizado genera una sesión con notas SOAP"
                    />
                  </TableCell>
                </TableRow>
              )}
              {data?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{formatDate(s.sessionDate, true)}</TableCell>
                  <TableCell>{s.dentistFullName ?? '-'}</TableCell>
                  <TableCell>
                    {s.procedures.length === 0 ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <span>{s.procedures.length} procedimiento(s)</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{s.assessment || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={SESSION_STATUS_VARIANT[s.status]}>
                      {SESSION_STATUS_LABEL[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/clinical-sessions/${s.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(s.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="¿Eliminar sesión clínica?"
        description="Esta acción no se puede deshacer. La sesión y todos sus procedimientos serán eliminados."
        variant="destructive"
        confirmLabel="Eliminar"
        loading={del.isPending}
        onConfirm={() => {
          if (!deleteId) return
          del.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
        }}
      />
    </div>
  )
}
