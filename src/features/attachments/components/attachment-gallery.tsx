'use client'
import { useMemo, useState } from 'react'
import { FileText, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState } from '@/components/shared/loading-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { AttachmentUploadDialog } from './attachment-upload-dialog'
import {
  useAttachments,
  useDeleteAttachment,
} from '../hooks/use-attachments'
import {
  badgeOfCategory,
  CATEGORIES_BY_GROUP,
  CATEGORY_META,
  GROUP_LABEL,
  labelOfCategory,
  type CategoryGroup,
} from '../config/labels'
import type {
  Attachment,
  AttachmentCategory,
  AttachmentOwnerType,
} from '../types/attachment.types'

interface Props {
  ownerType: AttachmentOwnerType
  ownerId: string
}

/**
 * Generic file gallery. Works for any owner type — drop it in patient,
 * session, estimate detail pages with `ownerType` + `ownerId` and the rest
 * just works. Filter by category, click a tile to view the file, delete
 * with confirmation.
 */
export function AttachmentGallery({ ownerType, ownerId }: Props) {
  const { data, isLoading } = useAttachments(ownerType, ownerId)
  const del = useDeleteAttachment(ownerType, ownerId)

  const [filter, setFilter] = useState<AttachmentCategory | 'all'>('all')
  const [viewing, setViewing] = useState<Attachment | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const visible = useMemo(
    () => (filter === 'all' ? data ?? [] : (data ?? []).filter((a) => a.category === filter)),
    [data, filter],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <Select value={filter} onValueChange={(v) => setFilter(v as AttachmentCategory | 'all')}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {(['imaging', 'documents'] as CategoryGroup[]).map((g) => (
                <div key={g}>
                  <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {GROUP_LABEL[g]}
                  </p>
                  {CATEGORIES_BY_GROUP[g].map((c) => (
                    <SelectItem key={c} value={c}>
                      {labelOfCategory(c)}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AttachmentUploadDialog ownerType={ownerType} ownerId={ownerId} />
      </div>

      {isLoading && <LoadingState />}

      {!isLoading && visible.length === 0 && (
        <EmptyState
          variant="block"
          icon={ImageIcon}
          title="Sin archivos"
          description="Subí radiografías, fotos clínicas o documentos"
        />
      )}

      {!isLoading && visible.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((a) => (
            <AttachmentTile
              key={a.id}
              attachment={a}
              onClick={() => setViewing(a)}
              onDelete={() => setDeleteId(a.id)}
            />
          ))}
        </div>
      )}

      {/* Viewer modal */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-4xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge className={cn(badgeOfCategory(viewing.category))}>
                    {labelOfCategory(viewing.category)}
                  </Badge>
                  <span>{viewing.fileName}</span>
                </DialogTitle>
                <DialogDescription>
                  {viewing.takenAt
                    ? `Tomada el ${formatDate(viewing.takenAt)}`
                    : `Subida el ${formatDate(viewing.createdAt)}`}
                  {viewing.toothFdi ? ` · Pieza ${viewing.toothFdi}` : ''}
                </DialogDescription>
              </DialogHeader>

              <AttachmentPreview attachment={viewing} />

              {viewing.description && (
                <p className="text-sm text-muted-foreground">{viewing.description}</p>
              )}
              <div className="flex justify-between">
                <Button asChild variant="outline">
                  <a href={viewing.downloadUrl} target="_blank" rel="noopener noreferrer">
                    Abrir / descargar
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteId(viewing.id)
                    setViewing(null)
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="¿Eliminar archivo?"
        description="El archivo será borrado permanentemente del almacenamiento."
        variant="destructive"
        confirmLabel="Eliminar"
        loading={del.isPending}
        onConfirm={() => {
          if (!deleteId) return
          del.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tile                                                                */
/* ------------------------------------------------------------------ */
function AttachmentTile({
  attachment,
  onClick,
  onDelete,
}: {
  attachment: Attachment
  onClick: () => void
  onDelete: () => void
}) {
  const isImage = attachment.contentType?.startsWith('image/') ?? false
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={onClick}
          className="block w-full bg-muted/30 transition-colors hover:bg-muted/60"
        >
          <div className="flex aspect-square items-center justify-center">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attachment.downloadUrl}
                alt={attachment.fileName}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
        </button>
        <div className="space-y-1 p-3">
          <div className="flex items-center justify-between gap-2">
            <Badge className={cn('text-[10px]', badgeOfCategory(attachment.category))}>
              {labelOfCategory(attachment.category)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="truncate text-xs font-medium" title={attachment.fileName}>
            {attachment.fileName}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {attachment.takenAt
              ? formatDate(attachment.takenAt)
              : formatDate(attachment.createdAt)}
            {attachment.toothFdi ? ` · #${attachment.toothFdi}` : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Preview inside the modal                                            */
/* ------------------------------------------------------------------ */
function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.contentType?.startsWith('image/') ?? false
  const isPdf = attachment.contentType === 'application/pdf'

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.downloadUrl}
        alt={attachment.fileName}
        className="max-h-[70vh] w-full rounded-md object-contain"
      />
    )
  }
  if (isPdf) {
    return (
      <iframe
        src={attachment.downloadUrl}
        className="h-[70vh] w-full rounded-md border"
        title={attachment.fileName}
      />
    )
  }
  return (
    <div className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
      Vista previa no disponible. Usá &quot;Abrir / descargar&quot;.
    </div>
  )
}
