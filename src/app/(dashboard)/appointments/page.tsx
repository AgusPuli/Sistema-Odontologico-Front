'use client'
import { useState } from 'react'
import { CalendarPlus, CalendarX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState } from '@/components/shared/loading-state'
import { FormField } from '@/components/shared/form-field'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { APPOINTMENT_STATUS_LABEL } from '@/lib/constants'
import {
  useAppointmentsByDate,
  useDeleteAppointment,
} from '@/features/appointments/hooks/use-appointments'
import { AppointmentDialog } from '@/features/appointments/components/appointment-dialog'

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = useAppointmentsByDate(date)
  const del = useDeleteAppointment()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Turnos del día seleccionado"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <CalendarPlus className="h-4 w-4" /> Nuevo turno
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtrar por fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField id="date" label="Día" className="max-w-xs">
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Odontólogo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <LoadingState variant="row" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      variant="row"
                      icon={CalendarX}
                      title="No hay turnos para este día"
                    />
                  </TableCell>
                </TableRow>
              )}
              {data?.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono">{a.appointmentTime?.slice(0, 5)}</TableCell>
                  <TableCell>{a.durationMinutes} min</TableCell>
                  <TableCell>{a.patientFullName ?? '-'}</TableCell>
                  <TableCell>{a.dentistFullName ?? '-'}</TableCell>
                  <TableCell>{a.reason ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {APPOINTMENT_STATUS_LABEL[a.status] || a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(a.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AppointmentDialog open={createOpen} onOpenChange={setCreateOpen} defaultDate={date} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="¿Eliminar turno?"
        description="Esta acción no se puede deshacer."
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
