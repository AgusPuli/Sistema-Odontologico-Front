'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { calculateAge, formatDate } from '@/lib/utils'
import { usePatientsList } from '../hooks/use-patients'

export function PatientList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const { data, isLoading } = usePatientsList({ search, page })

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="pl-8"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Obra social</TableHead>
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
                No se encontraron pacientes
              </TableCell>
            </TableRow>
          )}
          {data?.content.map((p) => {
            const age = calculateAge(p.birthDate)
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/patients/${p.id}`} className="font-medium text-primary hover:underline">
                    {p.fullName}
                  </Link>
                  {p.email && <p className="text-xs text-muted-foreground">{p.email}</p>}
                </TableCell>
                <TableCell>{p.documentNumber || '-'}</TableCell>
                <TableCell>{age !== null ? `${age} a` : '-'}</TableCell>
                <TableCell>{p.phone || '-'}</TableCell>
                <TableCell>{p.healthInsurance || '-'}</TableCell>
                <TableCell>
                  {p.active ? (
                    <Badge variant="success">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {data.number + 1} de {data.totalPages} — {data.totalElements} pacientes
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Última actualización: {formatDate(new Date(), true)}
      </p>
    </Card>
  )
}
