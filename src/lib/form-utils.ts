/**
 * Strip empty strings (and optionally whitespace-only strings) from a flat object.
 * Use it on form submit so `documentNumber: ''` becomes `undefined`, which the
 * backend treats as "field not provided" instead of "field set to empty".
 *
 * @param input plain object as returned by react-hook-form
 * @returns a new object with empty values removed
 */
export function cleanEmptyStrings<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === '' || value === null || value === undefined) continue
    if (typeof value === 'string' && value.trim() === '') continue
    out[key as keyof T] = value as T[keyof T]
  }
  return out
}
