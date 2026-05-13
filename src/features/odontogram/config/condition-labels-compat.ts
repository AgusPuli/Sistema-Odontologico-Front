/**
 * Backwards-compat shim. The old code used `TOOTH_CONDITION_LABEL[key]`
 * directly. New code should call `labelOf(key)` from ./conditions.
 * This file exists only so legacy imports keep working.
 */
import { CONDITION_META } from './conditions'
import type { ToothCondition } from '../types/odontogram.types'

export const TOOTH_CONDITION_LABEL: Record<string, string> = Object.fromEntries(
  (Object.keys(CONDITION_META) as ToothCondition[]).map((k) => [k, CONDITION_META[k].label]),
)
