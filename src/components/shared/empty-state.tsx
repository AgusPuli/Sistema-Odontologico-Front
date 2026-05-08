import { Inbox, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  /**
   * "row" renders the empty state inline inside a TableCell (single line, centered).
   * "block" (default) renders a vertical block with icon + texts + action.
   */
  variant?: 'row' | 'block'
}

/**
 * Single source of truth for empty results across the app. Use it in:
 *   - Empty list pages (variant="block")
 *   - Empty rows inside a table (variant="row" within a <TableCell colSpan>)
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No se encontró ninguna información',
  description,
  action,
  className,
  variant = 'block',
}: EmptyStateProps) {
  if (variant === 'row') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-1 py-6 text-muted-foreground', className)}>
        <Icon className="h-5 w-5 opacity-50" />
        <span className="text-sm">{title}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center',
        className
      )}
    >
      <Icon className="h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
