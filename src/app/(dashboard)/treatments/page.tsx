'use client'
import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { DENTAL_SPECIALTIES, DENTAL_SPECIALTY_LABEL } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'
import {
  useSeedDefaultTreatments,
  useTreatmentsSearch,
} from '@/features/treatments/hooks/use-treatments'
import type { DentalSpecialty } from '@/stores/auth.store'

export default function TreatmentsPage() {
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState<DentalSpecialty | undefined>()
  const [page, setPage] = useState(0)
  const { data, isLoading } = useTreatmentsSearch({ search, specialty, page })
  const seed = useSeedDefaultTreatments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de tratamientos</h1>
          <p className="text-muted-foreground">Procedimientos disponibles agrupados por especialidad</p>
        </div>
        <Button onClick={() => seed.mutate()} disabled={seed.isPending} variant="outline">
          {seed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Cargar catálogo por defecto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />
          <Select
            value={specialty ?? 'all'}
            onValueChange={(v) => {
              setSpecialty(v === 'all' ? undefined : (v as DentalSpecialty))
              setPage(0)
            }}
          >
            <SelectTrigger>
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
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    Sin resultados. Probá cargar el catálogo por defecto.
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

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Página {data.number + 1} de {data.totalPages} — {data.totalElements} tratamientos
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
