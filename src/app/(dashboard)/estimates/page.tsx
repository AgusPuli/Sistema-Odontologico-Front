'use client'
import Link from 'next/link'
import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState } from '@/components/shared/loading-state'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { ESTIMATE_STATUS_LABEL } from '@/lib/constants'
import { formatDate, formatMoney } from '@/lib/utils'
import { useEstimatesList } from '@/features/estimates/hooks/use-estimates'

export default function EstimatesPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useEstimatesList(page)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description="Listado de presupuestos emitidos"
        actions={
          <Button asChild>
            <Link href="/estimates/new">
              <Plus className="h-4 w-4" /> Nuevo presupuesto
            </Link>
          </Button>
        }
      />

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
                  <TableCell colSpan={6}>
                    <LoadingState variant="row" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      variant="row"
                      icon={FileText}
                      title="No hay presupuestos cargados"
                    />
                  </TableCell>
                </TableRow>
              )}
              {data?.content.map((e) => (
                <TableRow key={e.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/estimates/${e.id}`} className="text-primary hover:underline">
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

          {data && (
            <DataTablePagination
              pageNumber={data.number}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              first={data.first}
              last={data.last}
              itemLabel="presupuestos"
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
