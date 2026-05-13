'use client'
import { useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/form-field'
import { useUploadAttachment } from '../hooks/use-attachments'
import {
  CATEGORIES_BY_GROUP,
  GROUP_LABEL,
  labelOfCategory,
} from '../config/labels'
import type {
  AttachmentCategory,
  AttachmentOwnerType,
} from '../types/attachment.types'

interface Props {
  ownerType: AttachmentOwnerType
  ownerId: string
  /** Default category preselected when the dialog opens. */
  defaultCategory?: AttachmentCategory
}

/**
 * Reusable upload dialog. Drop it anywhere — e.g. patient detail, session
 * detail, estimate page — and pass the owner + id. The same backend endpoint
 * handles all owners.
 */
export function AttachmentUploadDialog({ ownerType, ownerId, defaultCategory }: Props) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState<AttachmentCategory>(defaultCategory ?? 'PHOTO_INTRAORAL')
  const [toothFdi, setToothFdi] = useState<string>('')
  const [takenAt, setTakenAt] = useState<string>('')
  const [description, setDescription] = useState('')

  const upload = useUploadAttachment(ownerType, ownerId)

  const reset = () => {
    setFile(null)
    setCategory(defaultCategory ?? 'PHOTO_INTRAORAL')
    setToothFdi('')
    setTakenAt('')
    setDescription('')
  }

  const handleSubmit = () => {
    if (!file) return
    upload.mutate(
      {
        file,
        metadata: {
          ownerType,
          ownerId,
          category,
          toothFdi: toothFdi ? Number(toothFdi) : null,
          takenAt: takenAt || undefined,
          description: description || undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4" /> Subir archivo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Subir archivo</DialogTitle>
          <DialogDescription>
            Cargá radiografías, fotos clínicas o documentos. Tamaño máximo 25 MB.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <FormField id="file" label="Archivo">
            <Input
              id="file"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </FormField>

          <FormField id="cat" label="Categoría">
            <Select value={category} onValueChange={(v) => setCategory(v as AttachmentCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['imaging', 'documents'] as const).map((g) => (
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
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="fdi" label="Pieza (opcional)">
              <Input
                id="fdi"
                type="number"
                min={11}
                max={85}
                placeholder="-"
                value={toothFdi}
                onChange={(e) => setToothFdi(e.target.value)}
              />
            </FormField>
            <FormField id="taken" label="Fecha de toma">
              <Input
                id="taken"
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
              />
            </FormField>
          </div>

          <FormField id="desc" label="Descripción (opcional)">
            <Textarea
              id="desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: control post endodoncia pieza 16"
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!file || upload.isPending}>
            {upload.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Subir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
