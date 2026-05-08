import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * have passed since the last change. Used to avoid hitting the backend on
 * every keystroke in search inputs.
 *
 *   const [search, setSearch] = useState('')
 *   const debounced = useDebouncedValue(search, 300)
 *   useQuery({ queryKey: ['list', debounced], queryFn: () => api.list({ search: debounced }) })
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
