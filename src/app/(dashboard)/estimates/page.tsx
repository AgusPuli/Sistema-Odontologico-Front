'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ESTIMATE_STATUS_LABEL } from '@/lib/constants'
import { formatDate, formatMoney } from '@/lib/utils'
import { useEstimatesList } from '@/features/estimates/hooks/use-estimates'

export default function EstimatesPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useEstimatesList(page)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <p className="text-muted-foreground">Listado de presupuestos emitidos</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
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
              {!isLoading && data?.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No hay presupuestos cargados
                  </TableCell>
                </TableRow>
              )}
              {data?.content.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Link href={`/patients/${e.patientId}`} className="text-primary hover:underline">
                      {e.patientFullName ?? '-'}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(e.issueDate)}</TableCell>
                  <TableCell>{formatDate(e.validUntil)}</TableCell>
                  <TableCell>{e.items.length}</TableCell>
                  <TableCell className="font-medium">{formatMoney(e.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ESTIMATE_STATUS_LABEL[e.status] || e.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Página {data.number + 1} de {data.totalPages} — {data.totalElements} presupuestos
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={data.first} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
