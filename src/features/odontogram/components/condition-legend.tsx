import { TOOTH_CONDITION_LABEL } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ITEMS: Array<{ key: keyof typeof TOOTH_CONDITION_LABEL; cls: string }> = [
  { key: 'HEALTHY', cls: 'bg-tooth-healthy' },
  { key: 'CARIES', cls: 'bg-tooth-caries' },
  { key: 'EXTRACTED', cls: 'bg-tooth-extracted' },
  { key: 'RESTORATION', cls: 'bg-tooth-restoration' },
  { key: 'ENDODONTICS', cls: 'bg-tooth-endodontics' },
  { key: 'IMPLANT', cls: 'bg-tooth-implant' },
  { key: 'CROWN', cls: 'bg-tooth-crown' },
  { key: 'OBSERVATION', cls: 'bg-tooth-observation' },
  { key: 'MISSING', cls: 'bg-tooth-missing' },
]

export function ConditionLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {ITEMS.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <span className={cn('h-3 w-3 rounded border border-border', item.cls)} />
          <span className="text-muted-foreground">{TOOTH_CONDITION_LABEL[item.key]}</span>
        </div>
      ))}
    </div>
  )
}
