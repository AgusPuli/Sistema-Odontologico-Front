import type { AttachmentCategory } from '../types/attachment.types'

/**
 * Central label + grouping for attachment categories. Adding/removing a
 * category here updates the upload form, the gallery filter and the chip
 * displayed on each tile.
 */

export type CategoryGroup = 'imaging' | 'documents'

export interface CategoryMeta {
  key: AttachmentCategory
  label: string
  group: CategoryGroup
  /** Tailwind classes for the chip. Imaging uses cool tones, docs use warm. */
  badge: string
}

export const CATEGORY_META: Record<AttachmentCategory, CategoryMeta> = {
  // Imaging
  XRAY_PANORAMIC:  { key: 'XRAY_PANORAMIC',  label: 'Rx panorámica',        group: 'imaging', badge: 'bg-sky-500 text-white' },
  XRAY_PERIAPICAL: { key: 'XRAY_PERIAPICAL', label: 'Rx periapical',        group: 'imaging', badge: 'bg-sky-500 text-white' },
  XRAY_BITEWING:   { key: 'XRAY_BITEWING',   label: 'Rx aleta de mordida',  group: 'imaging', badge: 'bg-sky-500 text-white' },
  XRAY_OCCLUSAL:   { key: 'XRAY_OCCLUSAL',   label: 'Rx oclusal',           group: 'imaging', badge: 'bg-sky-500 text-white' },
  XRAY_CBCT:       { key: 'XRAY_CBCT',       label: 'Tomografía (CBCT)',    group: 'imaging', badge: 'bg-indigo-500 text-white' },
  PHOTO_INTRAORAL: { key: 'PHOTO_INTRAORAL', label: 'Foto intraoral',       group: 'imaging', badge: 'bg-emerald-500 text-white' },
  PHOTO_EXTRAORAL: { key: 'PHOTO_EXTRAORAL', label: 'Foto extraoral',       group: 'imaging', badge: 'bg-emerald-500 text-white' },
  PHOTO_SMILE:     { key: 'PHOTO_SMILE',     label: 'Foto de sonrisa',      group: 'imaging', badge: 'bg-emerald-500 text-white' },
  PHOTO_FACE:      { key: 'PHOTO_FACE',      label: 'Foto facial',          group: 'imaging', badge: 'bg-emerald-500 text-white' },
  // Documents
  CONSENT_FORM:        { key: 'CONSENT_FORM',        label: 'Consentimiento informado', group: 'documents', badge: 'bg-amber-500 text-white' },
  PRESCRIPTION:        { key: 'PRESCRIPTION',        label: 'Receta',                   group: 'documents', badge: 'bg-amber-500 text-white' },
  LAB_ORDER:           { key: 'LAB_ORDER',           label: 'Pedido a laboratorio',     group: 'documents', badge: 'bg-amber-500 text-white' },
  REFERRAL:            { key: 'REFERRAL',            label: 'Derivación / interconsulta', group: 'documents', badge: 'bg-amber-500 text-white' },
  INSURANCE_DOCUMENT:  { key: 'INSURANCE_DOCUMENT',  label: 'Documento de obra social', group: 'documents', badge: 'bg-amber-500 text-white' },
  REPORT:              { key: 'REPORT',              label: 'Informe médico',           group: 'documents', badge: 'bg-amber-500 text-white' },
  OTHER:               { key: 'OTHER',               label: 'Otro',                     group: 'documents', badge: 'bg-zinc-500 text-white' },
}

export const CATEGORIES_BY_GROUP: Record<CategoryGroup, AttachmentCategory[]> = {
  imaging: (Object.values(CATEGORY_META) as CategoryMeta[])
    .filter((m) => m.group === 'imaging')
    .map((m) => m.key),
  documents: (Object.values(CATEGORY_META) as CategoryMeta[])
    .filter((m) => m.group === 'documents')
    .map((m) => m.key),
}

export const GROUP_LABEL: Record<CategoryGroup, string> = {
  imaging: 'Imágenes',
  documents: 'Documentos',
}

export const labelOfCategory = (c: AttachmentCategory): string => CATEGORY_META[c]?.label ?? c
export const badgeOfCategory = (c: AttachmentCategory): string => CATEGORY_META[c]?.badge ?? 'bg-zinc-500 text-white'
