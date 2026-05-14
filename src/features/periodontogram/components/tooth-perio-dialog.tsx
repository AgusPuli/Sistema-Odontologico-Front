'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  FURCATION_LABEL,
  MOLAR_FDI,
  MOBILITY_LABEL,
  SITE_ORDER,
  pdColour,
} from '../config/labels'
import type {
  PeriodontalSiteKey,
  PeriodontalSiteRequest,
  PeriodontalToothData,
  UpdatePeriodontalToothRequest,
} from '../types/periodontogram.types'
import { cn } from '@/lib/utils'

interface Props {
  tooth: PeriodontalToothData | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (fdi: number, req: UpdatePeriodontalToothRequest) => void
  isSaving: boolean
}

interface SiteState {
  probingDepth: string
  recession: string
  bleeding: boolean
  suppuration: boolean
  plaque: boolean
}

function initSite(tooth: PeriodontalToothData | null, siteKey: PeriodontalSiteKey): SiteState {
  const s = tooth?.sites.find((x) => x.site === siteKey)
  return {
    probingDepth: s?.probingDepth != null ? String(s.probingDepth) : '',
    recession: s?.recession != null ? String(s.recession) : '',
    bleeding: s?.bleeding ?? false,
    suppuration: s?.suppuration ?? false,
    plaque: s?.plaque ?? false,
  }
}

function buildSiteStates(tooth: PeriodontalToothData | null): Record<PeriodontalSiteKey, SiteState> {
  return Object.fromEntries(
    SITE_ORDER.map((k) => [k, initSite(tooth, k)]),
  ) as Record<PeriodontalSiteKey, SiteState>
}

export function ToothPerioDialog({ tooth, open, onOpenChange, onSave, isSaving }: Props) {
  const [mobility, setMobility] = useState<string>('')
  const [furcation, setFurcation] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [sites, setSites] = useState<Record<PeriodontalSiteKey, SiteState>>(buildSiteStates(null))

  // Reset form when tooth changes
  useEffect(() => {
    if (!tooth) return
    setMobility(tooth.mobility != null ? String(tooth.mobility) : '')
    setFurcation(tooth.furcation != null ? String(tooth.furcation) : '')
    setNotes(tooth.notes ?? '')
    setSites(buildSiteStates(tooth))
  }, [tooth])

  if (!tooth) return null

  const isMolar = MOLAR_FDI.has(tooth.fdiNumber)

  function updateSite(key: PeriodontalSiteKey, patch: Partial<SiteState>) {
    setSites((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  function handleSave() {
    if (!tooth) return
    const siteReqs: PeriodontalSiteRequest[] = SITE_ORDER.map((k) => {
      const s = sites[k]
      const pd = s.probingDepth !== '' ? Number(s.probingDepth) : null
      const rec = s.recession !== '' ? Number(s.recession) : null
      return {
        site: k,
        probingDepth: pd,
        recession: rec,
        bleeding: s.bleeding,
        suppuration: s.suppuration,
        plaque: s.plaque,
      }
    })

    const req: UpdatePeriodontalToothRequest = {
      mobility: mobility !== '' ? Number(mobility) : null,
      furcation: isMolar && furcation !== '' ? Number(furcation) : null,
      notes: notes || null,
      sites: siteReqs,
    }
    onSave(tooth.fdiNumber, req)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Diente {tooth.fdiNumber}
            {isMolar && <span className="ml-2 text-xs text-muted-foreground">(molar)</span>}
          </DialogTitle>
        </DialogHeader>

        {/* ── Tooth-level fields ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Movilidad</Label>
            <Select value={mobility} onValueChange={setMobility}>
              <SelectTrigger>
                <SelectValue placeholder="Sin registro" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOBILITY_LABEL).map(([v, label]) => (
                  <SelectItem key={v} value={v}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isMolar && (
            <div className="space-y-1">
              <Label>Furca</Label>
              <Select value={furcation} onValueChange={setFurcation}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin registro" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FURCATION_LABEL).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label>Notas del diente</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones clínicas…"
            rows={2}
          />
        </div>

        {/* ── Site grid ─────────────────────────────────────────────── */}
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-left font-medium w-10">Sit.</th>
                <th className="text-center font-medium">PD (mm)</th>
                <th className="text-center font-medium">Rec. (mm)</th>
                <th className="text-center font-medium">Sangrado</th>
                <th className="text-center font-medium">Supuración</th>
                <th className="text-center font-medium">Placa</th>
              </tr>
            </thead>
            <tbody>
              {SITE_ORDER.map((k) => {
                const s = sites[k]
                const pd = s.probingDepth !== '' ? Number(s.probingDepth) : null
                return (
                  <tr key={k} className="bg-muted/30 rounded">
                    <td className="pl-2 py-1 font-mono font-semibold text-xs">{k}</td>
                    <td className="px-1 py-1 text-center">
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        className={cn(
                          'h-7 w-16 text-center text-sm mx-auto',
                          pdColour(pd),
                        )}
                        value={s.probingDepth}
                        onChange={(e) => updateSite(k, { probingDepth: e.target.value })}
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <Input
                        type="number"
                        min={-5}
                        max={20}
                        className="h-7 w-16 text-center text-sm mx-auto"
                        value={s.recession}
                        onChange={(e) => updateSite(k, { recession: e.target.value })}
                      />
                    </td>
                    <td className="text-center">
                      <Checkbox
                        checked={s.bleeding}
                        onCheckedChange={(v) => updateSite(k, { bleeding: Boolean(v) })}
                        className="border-rose-400 data-[state=checked]:bg-rose-500"
                      />
                    </td>
                    <td className="text-center">
                      <Checkbox
                        checked={s.suppuration}
                        onCheckedChange={(v) => updateSite(k, { suppuration: Boolean(v) })}
                        className="border-amber-400 data-[state=checked]:bg-amber-500"
                      />
                    </td>
                    <td className="text-center">
                      <Checkbox
                        checked={s.plaque}
                        onCheckedChange={(v) => updateSite(k, { plaque: Boolean(v) })}
                        className="border-yellow-400 data-[state=checked]:bg-yellow-500"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar diente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
