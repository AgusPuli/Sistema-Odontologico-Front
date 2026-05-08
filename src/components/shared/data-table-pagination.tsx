'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  /** Current page (0-indexed, matches Spring's Page.number) */
  pageNumber: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
  onPrev: () => void
  onNext: () => void
  /** Optional label shown next to the count, e.g. "pacientes" -> "20 pacientes" */
  itemLabel?: string
}

/**
 * Pagination footer for any list page using Spring Data's Page<T> shape.
 * Hidden automatically when there's a single page or no rows.
 */
export function DataTablePagination({
  pageNumber,
  totalPages,
  totalElements,
  first,
  last,
  onPrev,
  onNext,
  itemLabel,
}: Props) {
  if (totalPages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        Página {pageNumber + 1} de {totalPages} — {totalElements} {itemLabel ?? 'registros'}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={first} onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={last} onClick={onNext}>
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
