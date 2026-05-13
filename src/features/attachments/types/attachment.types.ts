export type AttachmentOwnerType =
  | 'PATIENT'
  | 'CLINICAL_SESSION'
  | 'ESTIMATE'
  | 'ODONTOGRAM'
  | 'APPOINTMENT'

export type AttachmentCategory =
  // Imaging
  | 'XRAY_PANORAMIC'
  | 'XRAY_PERIAPICAL'
  | 'XRAY_BITEWING'
  | 'XRAY_OCCLUSAL'
  | 'XRAY_CBCT'
  | 'PHOTO_INTRAORAL'
  | 'PHOTO_EXTRAORAL'
  | 'PHOTO_SMILE'
  | 'PHOTO_FACE'
  // Documents
  | 'CONSENT_FORM'
  | 'PRESCRIPTION'
  | 'LAB_ORDER'
  | 'REFERRAL'
  | 'INSURANCE_DOCUMENT'
  | 'REPORT'
  | 'OTHER'

/** Mirror of backend AttachmentResponse. `downloadUrl` is presigned and short-lived (~1h). */
export interface Attachment {
  id: string
  tenantId: string
  ownerType: AttachmentOwnerType
  ownerId: string
  toothFdi: number | null
  sessionId: string | null
  category: AttachmentCategory
  fileName: string
  contentType: string | null
  sizeBytes: number | null
  description: string | null
  takenAt: string | null
  createdAt: string
  createdBy: string | null
  downloadUrl: string
}

export interface UploadAttachmentMetadata {
  ownerType: AttachmentOwnerType
  ownerId: string
  category: AttachmentCategory
  toothFdi?: number | null
  sessionId?: string | null
  description?: string
  takenAt?: string
}
