'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { APPOINTMENT_STATUS_LABEL } from '@/lib/constants'
import { useAppointmentsByDate } from '@/features/appointments/hooks/use-appointments'

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const { data, isLoading } = useAppointmentsByDate(date)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agenda</h1>
        <p className="text-muted-foreground">Turnos del día seleccionado</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar por fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-xs flex-col gap-1">
            <Label htmlFor="date">Día</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No hay turnos para este día
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
