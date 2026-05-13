'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TREATMENT_STATUS_LABEL } from '@/lib/constants'
import { labelOf } from '../config/conditions'
import { formatDate } from '@/lib/utils'
import { useTreatmentPlan } from '../hooks/use-odontogram'
import type { TreatmentStatus } from '../types/odontogram.types'

export function TreatmentPlanTable({ odontogramId }: { odontogramId: string }) {
  const [status, setStatus] = useState<TreatmentStatus | ''>('')
  const { data, isLoading } = useTreatmentPlan(odontogramId, status || undefined)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Plan de tratamiento</CardTitle>
          <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : (v as TreatmentStatus))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="IN_PROGRESS">En curso</SelectItem>
              <SelectItem value="COMPLETED">Realizados</SelectItem>
              <SelectItem value="CANCELLED">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° diente</TableHead>
              <TableHead>Hallazgo</TableHead>
              <TableHead>Tratamiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Fecha</TableHead>
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
                  No se encontró ninguna información
                </TableCell>
              </TableRow>
            )}
            {data?.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono">{entry.fdiNumber}</TableCell>
                <TableCell>
                  {labelOf(entry.finding)}
                  {entry.surface && (
                    <span className="ml-1 text-xs text-muted-foreground">({entry.surface})</span>
                  )}
                </TableCell>
                <TableCell>
                  {entry.treatmentName ? (
                    <span>
                      <span className="font-mono text-xs text-muted-foreground">{entry.treatmentCode}</span>{' '}
                      {entry.treatmentName}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{TREATMENT_STATUS_LABEL[entry.treatmentStatus]}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{entry.note || '-'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(entry.recordedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
