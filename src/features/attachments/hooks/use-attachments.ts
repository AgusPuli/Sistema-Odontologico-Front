import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { attachmentApi } from '../api/attachment.api'
import { ApiError } from '@/types/api.types'
import { AttachmentOwnerType, UploadAttachmentMetadata } from '../types/attachment.types'

const KEYS = {
  list: (ownerType: AttachmentOwnerType, ownerId: string) =>
    ['attachments', ownerType, ownerId] as const,
}

export function useAttachments(ownerType: AttachmentOwnerType, ownerId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(ownerType, ownerId || ''),
    queryFn: () => attachmentApi.list(ownerType, ownerId as string),
    enabled: !!ownerId,
    select: (r) => r.data,
  })
}

export function useUploadAttachment(ownerType: AttachmentOwnerType, ownerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: UploadAttachmentMetadata }) =>
      attachmentApi.upload(file, metadata),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list(ownerType, ownerId) })
      toast.success('Archivo subido')
    },
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo subir el archivo'),
  })
}

export function useDeleteAttachment(ownerType: AttachmentOwnerType, ownerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => attachmentApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list(ownerType, ownerId) })
      toast.success('Archivo eliminado')
    },
    onError: (e: ApiError) => toast.error(e.message || 'No se pudo eliminar el archivo'),
  })
}
