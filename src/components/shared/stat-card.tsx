import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: React.ReactNode | string | number
  icon?: LucideIcon
  hint?: string
  className?: string
  iconClassName?: string
}

/**
 * KPI card used by the dashboard. Big number on the left, icon on the right,
 * optional sub-label/hint underneath.
 */
export function StatCard({ label, value, icon: Icon, hint, className, iconClassName }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-none">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-md bg-primary/10 p-3 text-primary', iconClassName)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
