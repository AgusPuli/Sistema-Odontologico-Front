/**
 * FDI numbering layout helpers.
 *
 * The chart is drawn as 4 rows so it visually mirrors a real mouth:
 *   row 1 = upper-right + upper-left permanent quadrants  (18..11, 21..28)
 *   row 2 = upper-right + upper-left primary quadrants    (55..51, 61..65)
 *   row 3 = lower-right + lower-left primary quadrants    (85..81, 71..75)
 *   row 4 = lower-right + lower-left permanent quadrants  (48..41, 31..38)
 *
 * For a PERMANENT odontogram only rows 1 and 4 carry teeth; the primary rows
 * are hidden. Same logic in reverse for PRIMARY.  MIXED shows all four rows.
 */
import type { Dentition } from '../types/odontogram.types'

// Permanent quadrants in the order they need to be displayed left-to-right in the chart
const UPPER_PERMANENT = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_PERMANENT = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
const UPPER_PRIMARY = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
const LOWER_PRIMARY = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]

export interface ToothRow {
  key: string
  label: string
  teeth: number[]
}

export function chartRows(dentition: Dentition): ToothRow[] {
  switch (dentition) {
    case 'PERMANENT':
      return [
        { key: 'upper-perm', label: 'Maxilar superior', teeth: UPPER_PERMANENT },
        { key: 'lower-perm', label: 'Maxilar inferior', teeth: LOWER_PERMANENT },
      ]
    case 'PRIMARY':
      return [
        { key: 'upper-prim', label: 'Maxilar superior', teeth: UPPER_PRIMARY },
        { key: 'lower-prim', label: 'Maxilar inferior', teeth: LOWER_PRIMARY },
      ]
    case 'MIXED':
      return [
        { key: 'upper-perm', label: 'Permanentes superiores', teeth: UPPER_PERMANENT },
        { key: 'upper-prim', label: 'Temporales superiores', teeth: UPPER_PRIMARY },
        { key: 'lower-prim', label: 'Temporales inferiores', teeth: LOWER_PRIMARY },
        { key: 'lower-perm', label: 'Permanentes inferiores', teeth: LOWER_PERMANENT },
      ]
  }
}
