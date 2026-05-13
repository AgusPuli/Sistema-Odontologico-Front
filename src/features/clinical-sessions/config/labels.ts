import type { ClinicalSessionStatus } from '../types/clinical-session.types'

export const SESSION_STATUS_LABEL: Record<ClinicalSessionStatus, string> = {
  DRAFT: 'Borrador',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
}

/**
 * Maps to shadcn Badge variants. Keep "success" for COMPLETED so it stands out.
 */
export const SESSION_STATUS_VARIANT: Record<
  ClinicalSessionStatus,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success'
> = {
  DRAFT: 'secondary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}
