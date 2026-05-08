'use client'
import { useState } from 'react'
import { Loader2, Sparkles, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState } from '@/components/shared/loading-state'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FormField } from '@/components/shared/form-field'
import { DENTAL_SPECIALTIES, DENTAL_SPECIALTY_LABEL } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  useSeedDefaultTreatments,
  useTreatmentsSearch,
} from '@/features/treatments/hooks/use-treatments'
import type { DentalSpecialty } from '@/stores/auth.store'

export default function TreatmentsPage() {
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState<DentalSpecialty | undefined>()
  const [page, setPage] = useState(0)
  const debounced = useDebouncedValue(search, 300)
  const { data, isLoading } = useTreatmentsSearch({ search: debounced, specialty, page })
  const seed = useSeedDefaultTreatments()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de tratamientos"
        description="Procedimientos disponibles agrupados por especialidad"
        actions={
          <Button onClick={() => seed.mutate()} disabled={seed.isPending} variant="outline">
            {seed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Cargar catálogo por defecto
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <FormField id="search" label="Buscar">
            <Input
              id="search"
              placeholder="Código o nombre..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />
          </FormField>
          <FormField id="specialty" label="Especialidad">
            <Select
              value={specialty ?? 'all'}
              onValueChange={(v) => {
                setSpecialty(v === 'all' ? undefined : (v as DentalSpecialty))
                setPage(0)
              }}
            >
              <SelectTrigger id="specialty">
                <SelectValue placeholder="Todas las especialidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las especialidades</SelectItem>
                {DENTAL_SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {DENTAL_SPECIALTY_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tratamiento</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio</TableHead>
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
                      icon={Stethoscope}
                      title="Sin resultados. Probá cargar el catálogo por defecto."
                    />
                  </TableCell>
                </TableRow>
              )}
              {data?.content.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.code}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.specialtyDisplay || t.specialty}</Badge>
                  </TableCell>
                  <TableCell>{t.durationMinutes ? `${t.durationMinutes} min` : '-'}</TableCell>
                  <TableCell>{formatMoney(t.defaultPrice)}</TableCell>
                  <TableCell>
                    {t.active ? (
                      <Badge variant="success">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
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
              itemLabel="tratamientos"
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
