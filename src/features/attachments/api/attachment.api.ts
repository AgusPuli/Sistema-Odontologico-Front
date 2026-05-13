import { api } from '@/lib/api'
import { ApiResponse } from '@/types/api.types'
import {
  Attachment,
  AttachmentOwnerType,
  UploadAttachmentMetadata,
} from '../types/attachment.types'

/**
 * Backend: AttachmentController @ /api/attachments.
 * Uploads use multipart/form-data with the file part + metadata fields.
 */
export const attachmentApi = {
  upload: async (file: File, metadata: UploadAttachmentMetadata) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('ownerType', metadata.ownerType)
    fd.append('ownerId', metadata.ownerId)
    fd.append('category', metadata.category)
    if (metadata.toothFdi != null) fd.append('toothFdi', String(metadata.toothFdi))
    if (metadata.sessionId) fd.append('sessionId', metadata.sessionId)
    if (metadata.description) fd.append('description', metadata.description)
    if (metadata.takenAt) fd.append('takenAt', metadata.takenAt)

    const r = await api.post<ApiResponse<Attachment>>('/attachments', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return r.data
  },

  list: async (ownerType: AttachmentOwnerType, ownerId: string) => {
    const r = await api.get<ApiResponse<Attachment[]>>('/attachments', {
      params: { ownerType, ownerId },
    })
    return r.data
  },

  getById: async (id: string) => {
    const r = await api.get<ApiResponse<Attachment>>(`/attachments/${id}`)
    return r.data
  },

  delete: async (id: string) => {
    const r = await api.delete<ApiResponse<void>>(`/attachments/${id}`)
    return r.data
  },
}
