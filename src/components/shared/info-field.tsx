import { cn } from '@/lib/utils'

interface InfoFieldProps {
  label: string
  value: React.ReactNode | string | null | undefined
  className?: string
  /** When true, renders the value in a muted style for emphasis on the label */
  muted?: boolean
}

/**
 * Read-only "label on top, value below" pair. Used everywhere we display
 * a record's data without an editable form (patient detail, tenant info,
 * profile, dashboard, etc.).
 */
export function InfoField({ label, value, className, muted }: InfoFieldProps) {
  const display = value === null || value === undefined || value === '' ? '-' : value
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('text-sm', muted && 'text-muted-foreground')}>{display}</p>
    </div>
  )
}
