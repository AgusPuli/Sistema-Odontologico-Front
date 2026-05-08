import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  label?: string
  className?: string
  /** "row" centers inline (e.g. inside a TableCell), "block" pads vertically */
  variant?: 'row' | 'block'
}

export function LoadingState({ label = 'Cargando...', className, variant = 'block' }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 text-sm text-muted-foreground',
        variant === 'block' ? 'py-10' : 'py-4',
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  )
}
