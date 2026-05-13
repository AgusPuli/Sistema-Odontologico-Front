import { cn } from '@/lib/utils'
import {
  CATEGORY_LABEL,
  CONDITIONS_BY_CATEGORY,
  bgClassOf,
  labelOf,
  symbolOf,
  type ConditionCategory,
} from '../config/conditions'

/**
 * Compact legend that lists every condition with its color chip and symbol,
 * grouped by category. Sourced 100% from config/conditions.ts so adding a
 * new finding shows it up automatically.
 */
export function ConditionLegend() {
  const cats: ConditionCategory[] = ['restorative', 'periodontal', 'anomaly', 'function']
  return (
    <div className="space-y-2 text-xs">
      {cats.map((cat) => (
        <div key={cat}>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABEL[cat]}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {CONDITIONS_BY_CATEGORY[cat].map((c) => (
              <div key={c} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border border-border text-[10px] font-bold text-white',
                    bgClassOf(c),
                  )}
                >
                  {symbolOf(c)}
                </span>
                <span className="text-muted-foreground">{labelOf(c)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
