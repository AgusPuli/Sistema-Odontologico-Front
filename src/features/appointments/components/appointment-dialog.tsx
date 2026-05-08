'use client'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { usePatientsList } from '@/features/patients/hooks/use-patients'
import { useCreateAppointment } from '../hooks/use-appointments'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
  /** When provided, locks the patient (e.g. when called from a patient page) */
  fixedPatientId?: string
}

/**
 * Quick-create modal for appointments. Pulls a paginated patient list with
 * debounced search; defaults the date to the agenda's current view.
 */
export function AppointmentDialog({ open, onOpenChange, defaultDate, fixedPatientId }: Props) {
  const create = useCreateAppointment()

  const [search, setSearch] = useState('')
  const [patientId, setPatientId] = useState(fixedPatientId ?? '')
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('09:00')
  const [duration, setDuration] = useState<number>(30)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const debouncedSearch = useDebouncedValue(search, 300)
  const { data: patients } = usePatientsList({ search: debouncedSearch, size: 50 })

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch('')
      setPatientId(fixedPatientId ?? '')
      setDate(defaultDate ?? new Date().toISOString().slice(0, 10))
      setTime('09:00')
      setDuration(30)
      setReason('')
      setNotes('')
    }
  }, [open, defaultDate, fixedPatientId])

  const submit = () => {
    if (!patientId) return
    create.mutate(
      {
        patientId,
        appointmentDate: date,
        appointmentTime: time,
        durationMinutes: duration,
        reason: reason || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo turno</DialogTitle>
          <DialogDescription>Asigná un horario y un paciente.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {!fixedPatientId && (
            <>
              <FormField id="patient-search" label="Buscar paciente">
                <Input
                  id="patient-search"
                  placeholder="Nombre, DNI..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </FormField>
              <FormField id="patient" label="Paciente" required>
                <Select value={patientId || undefined} onValueChange={setPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.content.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.fullName} {p.documentNumber ? `· ${p.documentNumber}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </>
          )}

          <FormField id="date" label="Fecha" required>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <FormField id="time" label="Hora" required>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </FormField>
          <FormField id="duration" label="Duración (min)">
            <Input
              id="duration"
              type="number"
              min={5}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 30)}
            />
          </FormField>
          <FormField id="reason" label="Motivo">
            <Input
              id="reason"
              placeholder="Control, limpieza, ortodoncia..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField id="notes" label="Notas">
              <Textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!patientId || create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear turno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
