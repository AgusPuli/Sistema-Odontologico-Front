import { TOOTH_CONDITION_LABEL } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ITEMS: Array<{ key: keyof typeof TOOTH_CONDITION_LABEL; cls: string }> = [
  // Restorative / surgical
  { key: 'HEALTHY', cls: 'bg-tooth-healthy' },
  { key: 'CARIES', cls: 'bg-tooth-caries' },
  { key: 'RESTORATION', cls: 'bg-tooth-restoration' },
  { key: 'ENDODONTICS', cls: 'bg-tooth-endodontics' },
  { key: 'CROWN', cls: 'bg-tooth-crown' },
  { key: 'EXTRACTED', cls: 'bg-tooth-extracted' },
  { key: 'MISSING', cls: 'bg-tooth-missing' },
  { key: 'IMPLANT', cls: 'bg-tooth-implant' },
  // Periodontal
  { key: 'GINGIVITIS', cls: 'bg-tooth-gingivitis' },
  { key: 'CALCULUS', cls: 'bg-tooth-calculus' },
  { key: 'GINGIVAL_RECESSION', cls: 'bg-tooth-recession' },
  { key: 'ABSCESS', cls: 'bg-tooth-abscess' },
  // Anomalies / positioning
  { key: 'ROTATION', cls: 'bg-tooth-rotation' },
  { key: 'MALPOSITION', cls: 'bg-tooth-malposition' },
  { key: 'DIASTEMA', cls: 'bg-tooth-diastema' },
  { key: 'FUSION', cls: 'bg-tooth-fusion' },
  { key: 'GEMINATION', cls: 'bg-tooth-gemination' },
  { key: 'IMPACTED', cls: 'bg-tooth-impacted' },
  // Function / wear
  { key: 'MOBILITY', cls: 'bg-tooth-mobility' },
  { key: 'BRUXISM', cls: 'bg-tooth-bruxism' },
  { key: 'OBSERVATION', cls: 'bg-tooth-observation' },
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
