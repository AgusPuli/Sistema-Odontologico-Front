import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

/**
 * Standard page header used across the dashboard.
 * Title on the left, optional description below it, optional action buttons on the right.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
